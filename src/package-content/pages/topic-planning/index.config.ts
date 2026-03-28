export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '选题策划' })
  : { navigationBarTitleText: '选题策划' }
