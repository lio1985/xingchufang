export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '编辑课程' })
  : { navigationBarTitleText: '编辑课程' }
