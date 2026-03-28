export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '课程培训', backgroundColor: '#0a0a0b' })
  : { navigationBarTitleText: '课程培训', backgroundColor: '#0a0a0b' };
