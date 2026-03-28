export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '直播数据' })
  : { navigationBarTitleText: '直播数据' };
