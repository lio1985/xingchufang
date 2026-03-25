export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '公司资料', backgroundColor: '#0a0a0b' })
  : { navigationBarTitleText: '公司资料', backgroundColor: '#0a0a0b' };
