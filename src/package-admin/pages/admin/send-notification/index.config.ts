export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '发送通知',
      backgroundColor: '#f5f5f5',
    })
  : {
      navigationBarTitleText: '发送通知',
      backgroundColor: '#f5f5f5',
    };
