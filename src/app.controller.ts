import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from './events/entities/event.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly sequelize: Sequelize,
    
    @InjectModel(Event)
    private eventModel: typeof Event,
  ) {}

  @Get('events')
  async runQuery() {
    const eventsslugs = ['north-american-dart-players', 'the-2024-pdc-us-darts-masters', 'classic-event'];

    const existingEvents = await this.eventModel.findAll({
      where: {
        slug: {
          [Op.in]: eventsslugs,
        },
      },
    });

    const existingSlugs = existingEvents.map(event => event.slug);

    const missingIndexes = eventsslugs
                            .map((slug, index) => (!existingSlugs.includes(slug) ? index : null))
                            .filter(index => index !== null);

    const missingEvents = missingIndexes.map(index => {
      return {
        event_name: '',
        slug: '',
        description: '',
        status: 1,
      }
    });

    // await this.eventModel.bulkCreate(missingEvents);

    return missingEvents;
  }
}