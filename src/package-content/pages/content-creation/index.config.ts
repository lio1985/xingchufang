export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '内容创作' })
  : { navigationBarTitleText: '内容创作' }
