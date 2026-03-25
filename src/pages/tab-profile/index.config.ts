export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '我' })
  : { navigationBarTitleText: '我' }
