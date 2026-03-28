import type { UserConfigExport } from "@tarojs/cli"

export default {
  mini: {
    // 小程序端压缩配置
    miniCssExtractPluginOption: {
      ignoreOrder: true,
    },
  },
  h5: {
    // 确保产物为 es5
    legacy: true,
  }
} satisfies UserConfigExport<'vite'>
