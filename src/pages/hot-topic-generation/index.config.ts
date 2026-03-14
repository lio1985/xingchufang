export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: 'AI 选题' })
  : { navigationBarTitleText: 'AI 选题' }
