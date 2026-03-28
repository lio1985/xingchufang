export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '门店详情' })
  : { navigationBarTitleText: '门店详情' }
