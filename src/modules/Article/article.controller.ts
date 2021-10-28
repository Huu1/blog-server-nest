import {
  Controller, Post, Get,
  Body, Query, Patch, Param, Delete, UseInterceptors,
  UploadedFile, UseGuards, Req
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArticleService } from './article.service';
import { addArticleDto, ArticleDto, publishDto } from './article.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) { }


  // 新建一个草稿
  @Post('new')
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

  // 获取所有草稿
  @Get('allDraft')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  getAllDraft(@Req() req) {
    return this.articleService.getAllDraft(req.uid);
  }

  // 传用户id 获取所有已发布的文章
  @Get('queryAllPublish')
  getAllPublishArticle(@Query() data) {
    return this.articleService.getAllPublishArticle(data);
  }

  //查询一篇文章
  @Get(':id')
  findOneArticle(@Param() { id }) {
    return this.articleService.findOneArticle(id);
  }



  //  用户发布文章
  @Post('pushlish')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  @UseInterceptors(FileInterceptor('file'))
  userPublishArticle(@Body() article: publishDto, @UploadedFile() file, @Req() req) {
    return this.articleService.userPublishArticle({ ...article, uid: req.uid }, file);
  }

  // 管理员获取所有用户文章
  @Post('allArticle')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  getAllArticle(@Body() data: any) {
    return this.articleService.getAllArticle(data);
  }

  // 获取当前用户的所有文章 
  @Post('queryAll')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  queryAll(@Body() data: any, @Req() req) {
    return this.articleService.queryAll(data, req.uid);
  }

  // // 管理员审核文章
  // @Post('setAudit')
  // @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.Admin)
  // setAudit(@Body() param,) {
  //   return this.articleService.setAudit(param);
  // }
}
