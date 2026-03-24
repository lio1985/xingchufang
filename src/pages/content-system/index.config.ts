export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '内容创作系统',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '内容创作系统',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white'
    };
