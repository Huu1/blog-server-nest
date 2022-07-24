import { Body, Controller, Get, HttpCode, Post, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Roles } from './roles.decorator';
import { Role } from './role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // 登录测试
  @Post('/login')
  async login(@Body() user) {
    return this.authService.login(user);
  }

  @Post('/register')
  async register(@Body() user) {
    return this.authService.register(user);
  }

  @Post('/refresh')
  async refresh(@Body() { token }, @Res() res: Response) {
    return this.authService.refresh(token, res);
  }

  @Get('/getConfig')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.User)
  async getAppData( @Req() req) {
    return this.authService.getAppData(req.uid);
  }

}


