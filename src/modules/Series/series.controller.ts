import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { SeriesDto } from './series.dto';
import { SeriesService } from './series.service';

@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  // 新建
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  createSeries(@Body() data: SeriesDto) {
    return this.seriesService.createSeries(data);
  }

  // 编辑
  @Post('edit/:id')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  editSeries(@Param() { id }, @Body() data: SeriesDto) {
    return this.seriesService.editSeries(id, data);
  }

  // 获取系列下文章列表
  @Get(':name')
  getArticleList(@Param() { name }, @Query() { pageSize, pageNumber }) {
    return this.seriesService.getArticleList(name, pageSize, pageNumber);
  }

  // 获取系列下的文章
  @Get(':name/:id')
  getArticle(@Param() { name, id }) {
    return this.seriesService.getArticle(name, id);
  }

  // 获取所有系列
  @Get()
  getAllSeries() {
    return this.seriesService.getAllSeries();
  }
}
