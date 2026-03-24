export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '团队详情',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#020617',
    })
  : {
      navigationBarTitleText: '团队详情',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#020617',
    };
