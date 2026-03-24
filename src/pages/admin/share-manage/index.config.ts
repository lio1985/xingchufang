export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '共享管理' })
  : { navigationBarTitleText: '共享管理' }
