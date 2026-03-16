export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '智能选题' })
  : { navigationBarTitleText: '智能选题' }
