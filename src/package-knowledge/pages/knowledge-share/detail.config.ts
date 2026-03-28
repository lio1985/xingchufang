export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '知识分享详情' })
  : { navigationBarTitleText: '知识分享详情' }
