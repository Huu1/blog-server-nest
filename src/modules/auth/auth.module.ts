import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { TagModule } from '../Tag/tag.module';
import { Tag } from '../Tag/entity/tag.entity';
// import { GroupMap } from '../group/entity/group.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Tag]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, {
    provide: APP_GUARD,
    useClass: RolesGuard,
  }],
  exports: [AuthService],
})
export class AuthModule { }
