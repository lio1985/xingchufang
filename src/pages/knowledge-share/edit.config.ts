export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '编辑知识分享' })
  : { navigationBarTitleText: '编辑知识分享' }
