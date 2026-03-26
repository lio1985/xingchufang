export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '星小帮',
      navigationBarBackgroundColor: '#141416',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0a0a0b',
    })
  : {
      navigationBarTitleText: '星小帮',
      navigationBarBackgroundColor: '#141416',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0a0a0b',
    }
