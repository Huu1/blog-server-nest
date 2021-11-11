/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { TolikeDto } from './like.dto';
import { LikeService } from './like.service';

@Controller('like')
export class LikeController {
  constructor(
    private readonly likeService: LikeService
  ) { }

  // 评论文章
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  toLike(@Body() tolikeDto: TolikeDto, @Req() req) {
    return this.likeService.toLike(tolikeDto, req.uid);
  }
}
