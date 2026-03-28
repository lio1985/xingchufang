export default typeof definePageConfig === 'function'
  ? definePageConfig({ navigationBarTitleText: '个人收藏', backgroundColor: '#0a0a0b' })
  : { navigationBarTitleText: '个人收藏', backgroundColor: '#0a0a0b' };
