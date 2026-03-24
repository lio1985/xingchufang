export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '灵感速记' })
  : { navigationBarTitleText: '灵感速记' }
