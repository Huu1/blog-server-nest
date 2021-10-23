import {
  Controller, Post, Get,
  Body, Query, Patch, Param, Delete, UseInterceptors,
  UploadedFile, UseGuards, Req
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @Roles(Role.Admin)
  getUsers(@Query('uid') uid: string) {
    return this.userService.getUser(uid);
  }

  @Post()
  postUsers(@Body('userIds') userIds: string) {
    return this.userService.postUsers(userIds);
  }

  @Patch('username')
  updateUserName(@Body() user) {
    return this.userService.updateUserName(user);
  }

  @Patch('password')
  updatePassword(@Body() user, @Query('password') password) {
    return this.userService.updatePassword(user, password);
  }

  @Patch('/jurisdiction/:userId')
  jurisdiction(@Param('userId') userId) {
    return this.userService.jurisdiction(userId);
  }

  @Delete()
  delUser(@Query() { uid, psw, did }) {
    return this.userService.delUser(uid, psw, did);
  }

  @Get('/findByName')
  getUsersByName(@Query('username') username: string) {
    return this.userService.getUsersByName(username);
  }

  @Post('/avatar')
  @Roles(Role.User)
  @UseInterceptors(FileInterceptor('file'))
  setUserAvatar(@Body() user, @UploadedFile() file, @Req() req) {
    return this.userService.setUserAvatar({ ...user, uid: req.uid }, file);
  }

}
