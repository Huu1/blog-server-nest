import { Injectable } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { RCode } from 'src/common/constant/rcode';
import { nameVerify, passwordVerify } from 'src/common/tool/utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async getUser(userId: string) {
    try {
      let data;
      if (userId) {
        data = await this.userRepository.findOne({
          where: { userId: userId }
        });
        return { msg: '获取用户成功', data };
      }
    } catch (e) {
      return { code: RCode.ERROR, msg: '获取用户失败', data: e };
    }
  }

  async postUsers(userIds: string) {
    try {
      if (userIds) {
        const userIdArr = userIds.split(',');
        const userArr = [];
        for (const userId of userIdArr) {
          if (userId) {
            const data = await this.userRepository.findOne({
              where: { userId: userId }
            });
            userArr.push(data);
          }
        }
        return { msg: '获取用户信息成功', data: userArr };
      }
      return { code: RCode.FAIL, msg: '获取用户信息失败', data: null };
    } catch (e) {
      return { code: RCode.ERROR, msg: '获取用户信息失败', data: e };
    }
  }

  async updateUserName(user: User) {
    try {
      const oldUser = await this.userRepository.findOne({ userId: user.userId, password: user.password });
      if (oldUser && nameVerify(user.username)) {
        const isHaveName = await this.userRepository.findOne({ username: user.username });
        if (isHaveName) {
          return { code: 1, msg: '用户名重复', data: '' };
        }
        const newUser = JSON.parse(JSON.stringify(oldUser));
        newUser.username = user.username;
        newUser.password = user.password;
        await this.userRepository.update(oldUser, newUser);
        return { msg: '更新用户名成功', data: newUser };
      }
      return { code: RCode.FAIL, msg: '更新失败', data: '' };
    } catch (e) {
      return { code: RCode.ERROR, msg: '更新用户名失败', data: e };
    }
  }

  async updatePassword(user: User, password: string) {
    try {
      const oldUser = await this.userRepository.findOne({ userId: user.userId, username: user.username, password: user.password });
      if (oldUser && passwordVerify(password)) {
        const newUser = JSON.parse(JSON.stringify(oldUser));
        newUser.password = password;
        await this.userRepository.update(oldUser, newUser);
        return { msg: '更新用户密码成功', data: newUser };
      }
      return { code: RCode.FAIL, msg: '更新失败', data: '' };
    } catch (e) {
      return { code: RCode.ERROR, msg: '更新用户密码失败', data: e };
    }
  }

  async jurisdiction(userId: string) {
    const user = await this.userRepository.findOne({ userId: userId });
    const newUser = JSON.parse(JSON.stringify(user));
    if (user.username === '陈冠希') {
      newUser.role = 'admin';
      await this.userRepository.update(user, newUser);
      return { msg: '更新用户信息成功', data: newUser };
    }
  }

  async setUserStatus(uid) {
    try {
      const user = await this.userRepository.findOne({ userId: uid });
      if (user.role === 'admin') {
        return { code: RCode.ERROR, msg: '禁止对管理员操作' };
      }
      user.status = user.status === 0 ? 1 : 0;
      await this.userRepository.save(user);
      return {};
    } catch (e) {
      return { code: RCode.ERROR, msg: '系统异常' };
    }
  }

  async getUsersByName(username: string) {
    try {
      if (username) {
        const users = await this.userRepository.find({
          where: { username: Like(`%${username}%`) }
        });
        return { data: users };
      }
      return { code: RCode.FAIL, msg: '请输入用户名', data: null };
    } catch (e) {
      return { code: RCode.ERROR, msg: '查找用户错误', data: null };
    }
  }

  async setUserAvatar({ uid }, file) {
    const newUser = await this.userRepository.findOne({ userId: uid });
    if (newUser) {
      try {
        const random = Date.now() + '&';
        const stream = createWriteStream(join('public/avatar', random + file.originalname));
        stream.write(file.buffer);
        newUser.avatar = `api/avatar/${random}${file.originalname}`;
        await this.userRepository.save(newUser);
        return { msg: '修改头像成功', data: newUser };
      } catch (error) {
        return { code: RCode.FAIL, msg: '修改头像失败' };
      }

    } else {
      return { code: RCode.FAIL, msg: '修改头像失败' };
    }
  }


  async getUserList() {
    try {
      const result = await this.userRepository.findAndCount();
      return {
        data: result[0]
      };
    } catch (error) {
      return { code: RCode.FAIL, msg: '异常' };
    }
  }

  async createUser(user) {
    try {
      const hasOne = await this.userRepository.findOne({ username: user.username });
      if (hasOne) {
        return { code: RCode.ERROR, msg: '用户名已存在' };
      }
      await this.userRepository.save(user);
      return {};
    } catch (e) {
      return { code: RCode.ERROR, msg: '系统异常' };
    }
  }
}
