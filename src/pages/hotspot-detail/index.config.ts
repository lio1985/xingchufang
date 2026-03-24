export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '热点详情',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '热点详情',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
    }
