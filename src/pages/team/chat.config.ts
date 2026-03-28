export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '团队聊天' })
  : { navigationBarTitleText: '团队聊天' }
