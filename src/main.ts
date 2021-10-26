import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { logger } from './common/middleware/logger.middleware';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 全局中间件
  app.use(logger);

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 配置全局拦截器
  app.useGlobalInterceptors(new ResponseInterceptor());

  // 开启一个全局验证管道
  app.useGlobalPipes(new ValidationPipe());

  // 配置静态资源
  app.useStaticAssets(join(__dirname, '../', '/'), {
    prefix: '/',
    setHeaders: res => {
      res.set('Cache-Control', 'max-age=2592000');
    }
  });

  // 接口文档
  // const options = new DocumentBuilder()
  //   .setTitle('接口文档')
  //   .setDescription('系统接口文档')
  //   .setVersion('1.0')
  //   .build();
  // const document = SwaggerModule.createDocument(app, options);
  // SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: '*'
  });
  await app.listen(3000);
}
bootstrap();
