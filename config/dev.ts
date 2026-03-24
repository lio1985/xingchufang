import type { UserConfigExport } from "@tarojs/cli"

export default {
  mini: {
    debugReact: true,
  },
  h5: {
    devServer: {
      port: 5000,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    }
  }
} satisfies UserConfigExport<'vite'>
