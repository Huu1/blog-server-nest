import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from '../Classic/entity/label.entity';
import { LabelMap } from '../Classic/entity/labelMap.entity';
import { Tag } from '../Classic/entity/tag.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Article } from './entity/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Tag, Label, LabelMap])
  ],

  providers: [ArticleService],
  controllers: [ArticleController],
})
export class ArticleModule { }
