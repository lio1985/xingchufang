export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '星小帮' })
  : { navigationBarTitleText: '星小帮' }
