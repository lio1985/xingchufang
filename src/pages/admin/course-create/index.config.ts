export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '创建课程' })
  : { navigationBarTitleText: '创建课程' }
