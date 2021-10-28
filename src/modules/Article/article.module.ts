import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from '../Classic/entity/label.entity';
import { Tag } from '../Classic/entity/tag.entity';
import { User } from '../user/entity/user.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { Article } from './entity/article.entity';
import { ArticleContent } from './entity/articleContent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, Tag, Label, User, ArticleContent])
  ],

  providers: [ArticleService],
  controllers: [ArticleController],
})
export class ArticleModule { }
