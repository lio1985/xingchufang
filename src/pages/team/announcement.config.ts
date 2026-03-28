export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '团队公告' })
  : { navigationBarTitleText: '团队公告' }
