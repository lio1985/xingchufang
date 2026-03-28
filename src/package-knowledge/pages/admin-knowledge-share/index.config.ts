export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '知识分享管理',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      enablePullDownRefresh: true
    })
  : {
      navigationBarTitleText: '知识分享管理',
      navigationBarBackgroundColor: '#0f172a',
      navigationBarTextStyle: 'white',
      enablePullDownRefresh: true
    };
