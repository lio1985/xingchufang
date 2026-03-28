export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '多媒体管理',
      navigationBarBackgroundColor: '#0a0f1a',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '多媒体管理',
      navigationBarBackgroundColor: '#0a0f1a',
      navigationBarTextStyle: 'white',
    };
