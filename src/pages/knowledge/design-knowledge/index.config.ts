export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '商厨设计知识' })
  : { navigationBarTitleText: '商厨设计知识' }
