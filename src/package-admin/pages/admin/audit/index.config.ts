export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '审计日志',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '审计日志',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white'
    }
