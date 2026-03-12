export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '客户详情',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0f172a'
    })
  : {
      navigationBarTitleText: '客户详情',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      backgroundColor: '#0f172a'
    }
