export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '直播记录' })
  : { navigationBarTitleText: '直播记录' }
