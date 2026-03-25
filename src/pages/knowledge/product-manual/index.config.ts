export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '产品使用说明书' })
  : { navigationBarTitleText: '产品使用说明书' }
