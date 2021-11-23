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
import { createUserDto } from './user.dto';

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

  @Get('findAll')
  @Roles(Role.Admin)
  getUserList() {
    return this.userService.getUserList();
  }

  @Post('status')
  @Roles(Role.Admin)
  setUserStatus(@Body() { uid }) {
    return this.userService.setUserStatus(uid);
  }

  @Post('create')
  @Roles(Role.Admin)
  createUser(@Body() user: createUserDto) {
    return this.userService.createUser(user);
  }
}
