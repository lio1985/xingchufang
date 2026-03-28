export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '文件解析',
      navigationBarBackgroundColor: '#0a0f1a',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '文件解析',
      navigationBarBackgroundColor: '#0a0f1a',
      navigationBarTextStyle: 'white',
    };
