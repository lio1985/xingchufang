export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '我的团队',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#020617',
    })
  : {
      navigationBarTitleText: '我的团队',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#020617',
    };
