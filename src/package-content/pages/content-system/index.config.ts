export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '内容体系' })
  : { navigationBarTitleText: '内容体系' }
