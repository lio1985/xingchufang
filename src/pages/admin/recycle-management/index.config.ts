export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '回收门店管理'
    })
  : { navigationBarTitleText: '回收门店管理' }
