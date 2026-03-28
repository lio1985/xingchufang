export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '任务分配' })
  : { navigationBarTitleText: '任务分配' }
