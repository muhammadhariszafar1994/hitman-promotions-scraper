import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from './events/entities/event.entity';
import puppeteer from 'puppeteer';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppService.name);
  
  constructor(
    private readonly appService: AppService,
    private readonly sequelize: Sequelize,
    
    @InjectModel(Event)
    private eventModel: typeof Event,
  ) {}

  to_slug = (text) => {
    return text
        .toLowerCase()                     // Convert to lowercase
        .trim()                             // Remove whitespace from both ends
        .replace(/[^\w\s-]/g, '')           // Remove special characters
        .replace(/\s+/g, '-')               // Replace spaces with dashes
        .replace(/-+/g, '-');               // Replace multiple dashes with a single dash
  }

  @Get('events')
  async scrapEvents() {
    this.logger.debug('---Cron Start---');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = 'https://champdarts.com/us-darts-masters/';
    const viewport = {width: 1080, height: 1024};

    await page.goto(url);
    await page.setViewport(viewport);

    const images = await page.evaluate(() => {
        const images = document.querySelectorAll('#av_section_1 .avia_image');
        return Array.from(images).map(img => img['src']);
    });

    const headings = await page.evaluate(() => {
        const headings = document.querySelectorAll('#av_section_1 .av-special-heading-tag .av-heading-link');
        return Array.from(headings).map(link => link['text']);
    });

    const required_content_classes = await page.evaluate(() => {
        const section_actual_require_classes = {};

        document.querySelectorAll('#av_section_1 .av_textblock_section').forEach((item) => {
            const section_classes = item.className;
            const section_classes_array = section_classes.split(" ").filter(className => className !== "");
            const section_classes_array_last_value = section_classes_array[section_classes_array.length - 1];
            const section_class = section_classes.replace(/\s/g, '');

            section_actual_require_classes[section_class] = section_classes_array_last_value;
        });
        
        return section_actual_require_classes;
    });

    const descriptions = await page.evaluate((required_content_classes) => {
        let contentArray = [];
        let index = 0;

        for (const key in required_content_classes) {
            if (Object.prototype.hasOwnProperty.call(required_content_classes, key)) {
                const required_class = required_content_classes[key];
                const elements = document.querySelectorAll('#av_section_1 .' + required_class + ' .avia_textblock');
                
                if (elements) {
                    contentArray[index] = contentArray[index] || [];

                    elements.forEach((ele) => {
                      contentArray[index] += ele.innerHTML;
                    });
                }
            }

            index++;
        }

        return contentArray;
    }, required_content_classes);
    
    const slugs = headings.map(item => this.to_slug(item));
    
    console.log('headings', headings);
    console.log('slugs', slugs);
    console.log('descriptions', descriptions);
    console.log('images', images);
    
    // check and insert events
    const existingEvents = await this.eventModel.findAll({
        where: {
          slug: {
            [Op.in]: slugs,
          },
        },
    });
    const existingSlugs = existingEvents.map(event => event.slug);
    const missingIndexes = slugs
                            .map((slug, index) => (!existingSlugs.includes(slug) ? index : null))
                            .filter(index => index !== null);
    const missingEvents = missingIndexes.map(index => ({
      event_name: headings[index],
      slug: slugs[index],
      description: descriptions[index],
      image_url: images[index],
      status: 1,
      image_status: 1
    }));
                          

    console.log('missingEvents', missingEvents);
  
    await this.eventModel.bulkCreate(missingEvents);

    await browser.close();

    this.logger.debug('---Cron End---');
  }
}