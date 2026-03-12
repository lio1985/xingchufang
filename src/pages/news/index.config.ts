export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '热点资讯' })
  : { navigationBarTitleText: '热点资讯' }
