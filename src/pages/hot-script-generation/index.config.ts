export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '智能脚本' })
  : { navigationBarTitleText: '智能脚本' }
