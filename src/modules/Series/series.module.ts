import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { Series } from './entity/series.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Series]),
  ],

  providers: [SeriesService],
  controllers: [SeriesController],
})
export class SeriesModule { }
