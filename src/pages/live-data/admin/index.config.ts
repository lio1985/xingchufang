export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '数据管理' })
  : { navigationBarTitleText: '数据管理' }
