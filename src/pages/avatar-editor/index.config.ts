export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '修改头像',
      navigationBarBackgroundColor: '#111827',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '修改头像',
      navigationBarBackgroundColor: '#111827',
      navigationBarTextStyle: 'white',
    };
