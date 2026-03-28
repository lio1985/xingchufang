import type { UserConfigExport } from "@tarojs/cli"

export default {
  mini: {
    // 小程序端压缩配置
    miniCssExtractPluginOption: {
      ignoreOrder: true,
    },
  },
  h5: {
    // 禁用 legacy 构建，避免 Taro 初始化错误
    // 现代浏览器已广泛支持 ES6+，无需 legacy 兼容
    legacy: false,
  }
} satisfies UserConfigExport<'vite'>
