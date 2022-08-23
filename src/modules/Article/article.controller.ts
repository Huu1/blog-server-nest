import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArticleService } from './article.service';
import {
  addArticleDto,
  ArticleDto,
  deleteArticlePublishDto,
  publishDto,
} from './article.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  // 新建一个草稿
  @Post('write')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  addArticle(@Body() article: addArticleDto, @Req() req) {
    return this.articleService.addArticle(article, req.uid);
  }

  // 编辑草稿
  @Post('edit')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  editArticle(@Body() article: ArticleDto, @Req() req) {
    return this.articleService.editArticle({ ...article, uid: req.uid });
  }

  // 删除一个草稿
  @Post('del')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  deleteArticle(@Body() article: ArticleDto, @Req() req) {
    return this.articleService.deleteArticle({ ...article, uid: req.uid });
  }

  // 获取post
  @Get('post')
  getPostList(@Query() data) {
    return this.articleService.getPostList(data);
  }

  // 获取 草稿箱/垃圾箱 列表
  @Get('allDraft')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  getAllDraft(@Query() { status }) {
    return this.articleService.getAllDraft(status);
  }

  // 获取 所有文章
  @Get('allpost')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  getAllPost(@Query() params) {
    return this.articleService.getAllPost(params);
  }

  //查询 一篇post
  @Get(':id')
  findPost(@Param() { id }) {
    return this.articleService.findPost(id);
  }

  // @Post('queryAll')
  // @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.User)
  // queryAll(@Body() data: any, @Req() req) {
  //   return this.articleService.queryAll(data, req.uid);
  // }

  //  发布文章
  @Post('publish')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  @UseInterceptors(FileInterceptor('file'))
  userPublishArticle(@Body() article: publishDto, @Req() req) {
    return this.articleService.userPublishArticle({ ...article, uid: req.uid });
  }

  // @Get('near/:id')
  // getNearby(@Param() { id }) {
  //   return this.articleService.getNearby(id);
  // }

  @Get('draft/:id')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  getDraft(@Param() { id }) {
    return this.articleService.getDraft(id);
  }
}
