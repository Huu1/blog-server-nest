/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entity/tag.entity';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tag])
    ],
    providers: [TagService],
    controllers: [TagController],
})
export class TagModule {}
