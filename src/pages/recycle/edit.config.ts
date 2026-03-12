export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '编辑门店' })
  : { navigationBarTitleText: '编辑门店' }
