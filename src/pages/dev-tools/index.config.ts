export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '开发者工具',
    })
  : {
      navigationBarTitleText: '开发者工具',
    }
