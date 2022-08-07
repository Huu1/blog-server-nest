import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArticleModule } from './modules/Article/article.module';
import { SeriesModule } from './modules/Series/series.module';
import { TagModule } from './modules/Tag/tag.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'blog-nest',
      charset: "utf8", // 设置chatset编码为utf8mb4
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    UserModule,
    ArticleModule,
    SeriesModule,
    TagModule
  ],
})
export class AppModule { }
