export default typeof definePageConfig === 'function'
  ? definePageConfig({
    navigationBarTitleText: '灵感速记管理',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white'
  })
  : {
    navigationBarTitleText: '灵感速记管理',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white'
  };
