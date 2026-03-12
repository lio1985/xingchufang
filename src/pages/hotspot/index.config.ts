export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '全网热点' })
  : { navigationBarTitleText: '全网热点' }
