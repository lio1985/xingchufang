export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '选题推荐' })
  : { navigationBarTitleText: '选题推荐' }
