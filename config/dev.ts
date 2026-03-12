import type { UserConfigExport } from "@tarojs/cli"

export default {
  mini: {
    debugReact: true,
  },
  h5: {
    devServer: {
      port: 8080,
    }
  }
} satisfies UserConfigExport<'vite'>
