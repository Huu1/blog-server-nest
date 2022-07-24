import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ArticleService } from './article.service';
import {
  addArticleDto,
  ArticleDto,
  deleteArticlePublishDto,
  momentsDto,
  publishDto,
} from './article.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

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

  // 删除一个已发布的文章
  @Post('delPublish')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  delPublishArticle(@Body() { articleId }: deleteArticlePublishDto) {
    return this.articleService.delPublishArticle(articleId);
  }

  // 获取所有已发布的文章
  @Get('queryAllPublish')
  getAllPublishArticle(@Query() data) {
    return this.articleService.getAllPublishArticle(data);
  }

  // 获取草稿列表
  @Get('allDraft')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  getAllDraft(@Req() req) {
    return this.articleService.getAllDraft(req.uid);
  }

  //查询一篇文章
  @Get(':id')
  findOneArticle(@Param() { id }) {
    return this.articleService.findOneArticle(id);
  }

  @Post('queryAll')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  queryAll(@Body() data: any, @Req() req) {
    return this.articleService.queryAll(data, req.uid);
  }

  // //  发布文章
  // @Post('pushlish-old')
  // @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.User)
  // @UseInterceptors(FileInterceptor('file'))
  // userPublishArticle(
  //   @Body() article: publishDto,
  //   @UploadedFile() file,
  //   @Req() req,
  // ) {
  //   return this.articleService.userPublishArticle(
  //     { ...article, uid: req.uid },
  //     file,
  //   );
  // }

  //  发布文章
  @Post('pushlish')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  @UseInterceptors(FileInterceptor('file'))
  userPublishArticle(
    @Body() article: publishDto,
    @Req() req,
  ) {
    return this.articleService.userPublishArticle(
      { ...article, uid: req.uid },
    );
  }

  @Get('near/:id')
  getNearby(@Param() { id }) {
    return this.articleService.getNearby(id);
  }
}
