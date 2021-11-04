/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../Article/entity/article.entity';
import { User } from '../user/entity/user.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entity/comment.entity';
import { Replay } from './entity/replay.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment, User, Article, Replay])
    ],
    providers: [CommentService],
    controllers: [CommentController],
})
export class CommentModule { }
