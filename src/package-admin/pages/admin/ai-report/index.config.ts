export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '运营报告' })
  : { navigationBarTitleText: '运营报告' }
