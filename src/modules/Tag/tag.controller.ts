/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { TagDto } from './tag.dto';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) { }

  @Get()
  getTagList() {
    return this.tagService.getTagList();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  addTag(@Body() tag: TagDto) {
    return this.tagService.addTag(tag);
  }
}
