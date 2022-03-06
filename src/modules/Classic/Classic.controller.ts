/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { LabelService } from './label.service';
import { TagDto, LabelDto } from './tag.dto';
import { TagService } from './tag.service';

@Controller('classic')
export class ClassicController {
  constructor(
    private readonly tagService: TagService,
    private readonly labelService: LabelService,
  ) {}

  //添加一个 分类
  @Post('addTag')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  addTag(@Body() tag: TagDto) {
    return this.tagService.addTag(tag);
  }

  //删除一个 分类
  @Get('delTag/:id')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  delTag(@Param() { id }: any) {
    return this.tagService.delTag(id);
  }

  // 添加一个 标签
  @Post('addLabel')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  addLabel(@Body() label: LabelDto) {
    return this.labelService.addLabel(label);
  }

  // 删除一个 标签
  @Post('delLabel/:id')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  delLabel(@Param() { id }: any) {
    return this.labelService.delLabel(id);
  }

  // 统计各标签下的文章个数
  @Get('labelCount')
  async countArticleOfLabel() {
    return this.labelService.CountArticleOfLabel();
  }
  // 获取所有标签
  @Get('allLabel')
  async getAllLabel() {
    return this.labelService.getAllLabel();
  }
  // 获取此标签下的所有文章
  @Get('label/:id')
  async getArticleBylabelId(@Param() { id }: any) {
    return this.labelService.getArticleBylabelId(id);
  }

  // 统计各分类下的文章个数
  @Get('tagCount')
  async countArticleOfTag() {
    return this.tagService.CountArticleOfTag();
  }
  // 获取所有分类
  @Get('allTag')
  async getAllTag() {
    return this.tagService.getAllTag();
  }
  // 获取此分类的所有文章
  @Get('tag/:id')
  async getArticleByTagId(@Param() { id }: any) {
    return this.tagService.getArticleByTagId(id);
  }
}
