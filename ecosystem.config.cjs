// PM2 配置文件
// 使用方法：pm2 start ecosystem.config.cjs --env production

module.exports = {
  apps: [
    {
      name: 'star-kitchen-api',
      script: './server/dist/main.js',
      cwd: './',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // 环境变量文件
      env_file: './server/.env',
      // 日志配置
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 自动重启配置
      watch: false,
      max_memory_restart: '1G',
      // 进程管理
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      // 监控
      merge_logs: true,
    },
    {
      name: 'star-kitchen-web',
      script: './node_modules/.bin/serve',
      args: '-s dist-web -l 5000',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      // 环境变量文件
      env_file: './server/.env',
      // 日志配置
      error_file: './logs/web-error.log',
      out_file: './logs/web-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 自动重启配置
      watch: false,
      max_memory_restart: '500M',
      // 进程管理
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      // 监控
      merge_logs: true,
    },
  ],
  deploy: {
    production: {
      user: 'node',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/star-kitchen.git',
      path: '/var/www/star-kitchen',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': '',
    },
  },
};
