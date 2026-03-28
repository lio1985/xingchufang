export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '数据监控',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '数据监控',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white'
    }
