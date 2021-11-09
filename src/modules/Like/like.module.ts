/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { LikeService } from './like.service';

@Module({
    imports: [],
    controllers: [],
    providers: [LikeService],
})
export class LikeModule { }
