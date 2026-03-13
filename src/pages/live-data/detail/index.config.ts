export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '直播详情' })
  : { navigationBarTitleText: '直播详情' }
