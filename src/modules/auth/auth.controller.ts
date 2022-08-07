import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Roles } from './roles.decorator';
import { Role } from './role.enum';
import { loginDto } from './user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 登录
  @Post('login')
  async login(@Body() user: loginDto) {
    return this.authService.login(user);
  }

  // @Get('/getConfig')
  // @UseGuards(AuthGuard('jwt'))
  // @Roles(Role.User)
  // async getAppData(@Req() req) {
  //   return this.authService.getAppData(req.uid);
  // }
}
