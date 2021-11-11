/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../Article/entity/article.entity';
import { User } from '../user/entity/user.entity';
import { Like } from './entity/like.entity';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Like, User, Article])
    ],
    controllers: [LikeController],
    providers: [LikeService],
})
export class LikeModule { }
