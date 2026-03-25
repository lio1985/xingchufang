export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '消息中心',
      enablePullDownRefresh: true,
      backgroundColor: '#0a0a0b',
    })
  : {
      navigationBarTitleText: '消息中心',
      enablePullDownRefresh: true,
      backgroundColor: '#0a0a0b',
    };
