import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
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
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.Admin)
  getUsers(@Query('uid') uid: string) {
    return this.userService.getUser(uid);
  }

  @Patch('username')
  updateUserName(@Body() user) {
    return this.userService.updateUserName(user);
  }

  @Patch('password')
  updatePassword(@Body() user, @Query('password') password) {
    return this.userService.updatePassword(user, password);
  }

  @Post('/avatar')
  @Roles(Role.User)
  @UseInterceptors(FileInterceptor('file'))
  setUserAvatar(@Body() user, @UploadedFile() file, @Req() req) {
    return this.userService.setUserAvatar({ ...user, uid: req.uid }, file);
  }

  @Get('currentUser')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  getUser(@Req() req) {
    return this.userService.getUser(req.uid);
  }
}
