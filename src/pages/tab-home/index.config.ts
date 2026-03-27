export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '工作台',
      navigationBarBackgroundColor: '#0a0f1a',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '工作台',
      navigationBarBackgroundColor: '#0a0f1a',
      navigationBarTextStyle: 'white',
    }
