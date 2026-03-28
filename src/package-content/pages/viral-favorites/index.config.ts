export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '收藏夹' })
  : { navigationBarTitleText: '收藏夹' }
