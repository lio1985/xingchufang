export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '工作台' })
  : { navigationBarTitleText: '工作台' }
