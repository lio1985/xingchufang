export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '回收门店' })
  : { navigationBarTitleText: '回收门店' }
