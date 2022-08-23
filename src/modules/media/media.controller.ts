import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';

@Controller('media')
@UseGuards(AuthGuard('jwt'))
export class MediaController {
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  createSeries(@Body() data: any) {
    // return this.seriesService.createSeries(data);
  }
}
