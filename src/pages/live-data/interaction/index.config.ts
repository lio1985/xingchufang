export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '互动数据' })
  : { navigationBarTitleText: '互动数据' }
