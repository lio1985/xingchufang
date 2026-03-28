export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '回收订单' })
  : { navigationBarTitleText: '回收订单' }
