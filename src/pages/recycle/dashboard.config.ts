export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '回收统计' })
  : { navigationBarTitleText: '回收统计' }
