export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '课程详情', backgroundColor: '#0a0f1a' })
  : { navigationBarTitleText: '课程详情', backgroundColor: '#0a0f1a' };
