"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express = require("express");
const path_1 = require("path");
const http_status_interceptor_1 = require("./interceptors/http-status.interceptor");
function parsePort() {
    if (process.env.SERVER_PORT) {
        const port = parseInt(process.env.SERVER_PORT, 10);
        if (!isNaN(port) && port > 0 && port < 65536) {
            return port;
        }
    }
    if (process.env.PORT) {
        const port = parseInt(process.env.PORT, 10);
        if (!isNaN(port) && port > 0 && port < 65536) {
            return port;
        }
    }
    const args = process.argv.slice(2);
    const portIndex = args.indexOf('-p');
    if (portIndex !== -1 && args[portIndex + 1]) {
        const port = parseInt(args[portIndex + 1], 10);
        if (!isNaN(port) && port > 0 && port < 65536) {
            return port;
        }
    }
    return 3000;
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.useGlobalInterceptors(new http_status_interceptor_1.HttpStatusInterceptor());
    const h5Path = '/workspace/projects/dist-web';
    const fs = require('fs');
    const hasH5Build = fs.existsSync((0, path_1.join)(h5Path, 'index.html'));
    if (hasH5Build) {
        console.log('📱 H5 preview mode enabled');
        app.use(express.static(h5Path));
        app.use((req, res, next) => {
            if (!req.path.startsWith('/api/')) {
                res.sendFile((0, path_1.join)(h5Path, 'index.html'));
            }
            else {
                next();
            }
        });
    }
    else {
        console.log('🎯 Mini Program API mode');
        app.use((req, res, next) => {
            if (!req.path.startsWith('/api/')) {
                res.status(404).json({
                    statusCode: 404,
                    message: 'This is a WeChat Mini Program backend API server. API endpoints start with /api/',
                    error: 'Not Found',
                    hint: 'For H5 preview, run: pnpm build:web'
                });
            }
            else {
                next();
            }
        });
    }
    app.enableShutdownHooks();
    const primaryPort = parsePort();
    try {
        await app.listen(primaryPort);
        console.log(`Server running on http://localhost:${primaryPort}`);
        console.log(`Application is running on: http://localhost:${primaryPort}`);
    }
    catch (err) {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ 端口 ${primaryPort} 被占用! 请运行 'npx kill-port ${primaryPort}' 然后重试。`);
            process.exit(1);
        }
        else {
            throw err;
        }
    }
}
bootstrap();
//# sourceMappingURL=main.js.map