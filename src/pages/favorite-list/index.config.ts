export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '待拍清单',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    })
  : {
      navigationBarTitleText: '待拍清单',
      navigationBarBackgroundColor: '#ffffff',
      navigationBarTextStyle: 'black'
    };
