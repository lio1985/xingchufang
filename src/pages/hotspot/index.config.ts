export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '创作' })
  : { navigationBarTitleText: '创作' }
