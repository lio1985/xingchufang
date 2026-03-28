export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '流量数据' })
  : { navigationBarTitleText: '流量数据' }
