export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '消息中心',
      enablePullDownRefresh: true,
      backgroundColor: '#f5f5f5',
    })
  : {
      navigationBarTitleText: '消息中心',
      enablePullDownRefresh: true,
      backgroundColor: '#f5f5f5',
    };
