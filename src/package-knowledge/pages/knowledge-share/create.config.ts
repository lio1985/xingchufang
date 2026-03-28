export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '创建知识分享' })
  : { navigationBarTitleText: '创建知识分享' }
