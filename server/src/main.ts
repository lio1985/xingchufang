import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import * as express from 'express';
import { HttpStatusInterceptor } from '@/interceptors/http-status.interceptor';

function parsePort(): number {
  // 优先使用 SERVER_PORT（项目配置）
  if (process.env.SERVER_PORT) {
    const port = parseInt(process.env.SERVER_PORT, 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }

  // 其次使用环境变量 PORT
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }

  // 最后使用命令行参数
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const port = parseInt(args[portIndex + 1], 10);
    if (!isNaN(port) && port > 0 && port < 65536) {
      return port;
    }
  }

  // 默认端口
  return 3000;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 全局拦截器：统一将 POST 请求的 201 状态码改为 200
  app.useGlobalInterceptors(new HttpStatusInterceptor());

  // 小程序项目：不需要 H5 静态文件服务
  // API 请求会自动路由到对应的 Controller
  // 非API请求返回 404
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api/')) {
      res.status(404).json({
        statusCode: 404,
        message: 'This is a WeChat Mini Program backend API server. API endpoints start with /api/',
        error: 'Not Found'
      });
    } else {
      next();
    }
  });

  // 1. 开启优雅关闭 Hooks (关键!)
  app.enableShutdownHooks();

  // 2. 解析端口 - 使用 Coze 环境变量
  const primaryPort = parsePort();
  
  try {
    // 启动主端口
    await app.listen(primaryPort);
    console.log(`Server running on http://localhost:${primaryPort}`);
    console.log(`Application is running on: http://localhost:${primaryPort}`);
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 端口 ${primaryPort} 被占用! 请运行 'npx kill-port ${primaryPort}' 然后重试。`);
      process.exit(1);
    } else {
      throw err;
    }
  }
}
bootstrap();
