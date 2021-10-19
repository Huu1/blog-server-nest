import { TagModule } from './modules/Tag/tag.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
// import { ChatModule } from './modules/chat/chat.module';
// import { FriendModule } from './modules/friend/friend.module';
// import { GroupModule } from './modules/group/group.module';
import { AuthModule } from './modules/auth/auth.module';
import { ArticleModule } from './modules/Article/article.module';

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
      synchronize: true
    }),
    AuthModule,
    UserModule,
    ArticleModule,
    TagModule,
  ],
})
export class AppModule { }
