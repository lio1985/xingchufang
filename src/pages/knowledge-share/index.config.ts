export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '知识分享',
      navigationBarBackgroundColor: '#1e293b',
      navigationBarTextStyle: 'white'
    })
  : {
      navigationBarTitleText: '知识分享',
      navigationBarBackgroundColor: '#1e293b',
      navigationBarTextStyle: 'white'
    };
