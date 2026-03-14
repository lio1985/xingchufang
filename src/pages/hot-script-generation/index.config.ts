export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: 'AI 脚本' })
  : { navigationBarTitleText: 'AI 脚本' }
