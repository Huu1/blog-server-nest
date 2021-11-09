import { LikeModule } from './modules/Like/like.module';
import { ClassicModule } from './modules/Classic/classic.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArticleModule } from './modules/Article/article.module';
import { CommentModule } from './modules/Comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'blog-nest',
      charset: "utf8mb4", // 设置chatset编码为utf8mb4
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    UserModule,
    ArticleModule,
    ClassicModule,
    CommentModule,
    LikeModule,
  ],
})
export class AppModule { }
