export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '共享统计'
    })
  : { navigationBarTitleText: '共享统计' }
