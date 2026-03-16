export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '选题生成' })
  : { navigationBarTitleText: '选题生成' }
