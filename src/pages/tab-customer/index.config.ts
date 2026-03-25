export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '客资管理' })
  : { navigationBarTitleText: '客资管理' }
