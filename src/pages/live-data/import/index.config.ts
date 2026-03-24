export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '导入直播数据' })
  : { navigationBarTitleText: '导入直播数据' }
