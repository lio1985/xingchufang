export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '语料库管理' })
  : { navigationBarTitleText: '语料库管理' }
