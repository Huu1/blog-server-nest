/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassicController } from './Classic.controller';
import { Label } from './entity/label.entity';
import { LabelMap } from './entity/labelMap.entity';
import { Tag } from './entity/tag.entity';
import { LabelService } from './label.service';
import { TagService } from './tag.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tag, Label, LabelMap])
    ],
    providers: [TagService, LabelService],
    controllers: [ClassicController],
})
export class ClassicModule { }
