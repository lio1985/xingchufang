export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '说明书详情' })
  : { navigationBarTitleText: '说明书详情' }
