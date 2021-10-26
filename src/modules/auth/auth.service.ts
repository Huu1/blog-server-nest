import { HttpStatus, Injectable, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { nameVerify, passwordVerify } from 'src/common/tool/utils';
import { RCode } from 'src/common/constant/rcode';
import { Response } from 'express';
import { Tag } from '../Classic/entity/tag.entity';
import { Label } from '../Classic/entity/label.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
    private readonly jwtService: JwtService,
  ) { }

  async login(data: User): Promise<any> {
    const user = await this.userRepository.findOne({ username: data.username, password: data.password });
    if (!user) {
      return { code: 1, msg: '密码错误', data: '' };
    }
    if (!passwordVerify(data.password) || !nameVerify(data.username)) {
      return { code: RCode.FAIL, msg: '注册校验不通过！', data: '' };
    }
    const tagList = await this.tagRepository.find();
    const labelList = await this.labelRepository.find();

    user.password = data.password;
    const payload = { userId: user.userId, roles: [user.role] };
    return {
      msg: '登录成功',
      data: {
        user: user,
        appData: {
          tagList,
          labelList
        },
        token: this.jwtService.sign(payload)
      },
    };
  }

  async register(user: User): Promise<any> {
    const isHave = await this.userRepository.find({ username: user.username });
    if (isHave && isHave.length) {
      return { code: RCode.FAIL, msg: '用户名重复', data: '' };
    }
    if (!passwordVerify(user.password) || !nameVerify(user.username)) {
      return { code: RCode.FAIL, msg: '注册校验不通过！', data: '' };
    }
    user.avatar = `api/avatar/avatar(${Math.round(Math.random() * 19 + 1)}).png`;
    user.role = 'user';
    const newUser = await this.userRepository.save(user);
    const payload = { userId: newUser.userId, roles: ['user'] };
    return {
      msg: '注册成功',
      data: {
        user: newUser,
        token: this.jwtService.sign(payload),
      },
    };
  }

  async refresh(token: string, res): Promise<any> {
    try {
      const { iat, exp, userId } = this.jwtService.verify(token);
      if (exp - iat > 3600) {
        const user = await this.userRepository.findOne({ userId });
        const tagList = await this.tagRepository.find();
        const labelList = await this.labelRepository.find();
        res.status(HttpStatus.OK).send({
          data: {
            user,
            appData: {
              tagList,
              labelList
            }
          },
          msg: "",
          code: 0
        });
      }
      return res.status(HttpStatus.UNAUTHORIZED).send();
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).send();
    }
  }
}
