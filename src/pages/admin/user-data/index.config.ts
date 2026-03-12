export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '用户数据',
    })
  : {
      navigationBarTitleText: '用户数据',
    }
