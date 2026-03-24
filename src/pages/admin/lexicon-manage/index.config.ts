export default typeof definePageConfig === 'function'
  ? definePageConfig({
    navigationBarTitleText: '语料库管理',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white'
  })
  : {
    navigationBarTitleText: '语料库管理',
    navigationBarBackgroundColor: '#0f172a',
    navigationBarTextStyle: 'white'
  };
