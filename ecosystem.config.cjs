// PM2 配置文件（小程序专用）
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
    // 注意：已移除 star-kitchen-web 应用
    // 小程序不需要 H5 静态文件服务器
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
