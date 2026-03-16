export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '脚本生成' })
  : { navigationBarTitleText: '脚本生成' }
