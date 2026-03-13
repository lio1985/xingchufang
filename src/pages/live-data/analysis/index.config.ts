export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '直播复盘' })
  : { navigationBarTitleText: '直播复盘' }
