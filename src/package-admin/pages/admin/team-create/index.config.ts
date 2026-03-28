export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '创建团队',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#020617',
    })
  : {
      navigationBarTitleText: '创建团队',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#020617',
    };
