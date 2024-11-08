import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TaskService } from './task.service';
import { SequelizeModule } from '@nestjs/sequelize';
import Configuration from './config/configuration';
import { EventsModule } from './events/events.module';

import { Event } from './events/entities/event.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [Configuration]
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get('database.dialect'),
        host: configService.get('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        models: [Event],
      }),
    }),
    SequelizeModule.forFeature([Event]),
    
    // Modules
    EventsModule
  ],
  controllers: [AppController],
  providers: [AppService, TaskService],
})
export class AppModule {}
