export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '脚本创作' })
  : { navigationBarTitleText: '脚本创作' }
