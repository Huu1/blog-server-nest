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
import { TagDto } from './tag.dto';
import { TagService } from './tag.service';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  // 新建
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  createTag(@Body() data: TagDto) {
    return this.tagService.createTag(data);
  }

  // 编辑
  @Post('edit/:id')
  @UseGuards(AuthGuard('jwt'))
  @Roles(Role.Admin)
  editTag(@Param() { id }, @Body() data: TagDto) {
    return this.tagService.editTag(id, data);
  }

  // 获取tag下的文章列表
  @Get(':name')
  getArticleList(@Param() { name }, @Query() { pageSize, pageNumber }) {
    return this.tagService.getArticleList(name, pageSize, pageNumber);
  }

  // 获取tag列表
  @Get()
  getAllTags() {
    return this.tagService.getAllTags();
  }
}
