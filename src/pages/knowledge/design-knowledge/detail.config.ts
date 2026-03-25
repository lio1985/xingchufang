export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '知识详情' })
  : { navigationBarTitleText: '知识详情' }
