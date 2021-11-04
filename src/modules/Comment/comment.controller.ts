/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { CommentDto } from './comment.dto';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService
  ) { }

  // 评论文章
  @Post('')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  addTag(@Body() comment: CommentDto, @Req() req) {
    return this.commentService.addComment(comment, req.uid);
  }

  // 回复评论
  @Post('replay')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  replayComment(@Body() comment: CommentDto, @Req() req) {
    return this.commentService.replayComment(comment, req.uid);
  }

  // 获取一篇文章的评论
  @Get('/:id')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  findArticleComment(@Param() {id}, @Req() req) {
    return this.commentService.findArticleComment(id);
  }
}
