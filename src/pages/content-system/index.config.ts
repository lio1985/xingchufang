export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '内容生成系统',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '内容生成系统',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white'
    };
