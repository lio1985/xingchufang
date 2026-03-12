export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '登录',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0f172a'
    })
  : {
      navigationBarTitleText: '登录',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0f172a'
    }
