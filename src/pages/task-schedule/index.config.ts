export default typeof definePageConfig === 'function'
  ? definePageConfig({
      navigationBarTitleText: '任务调度',
      navigationBarBackgroundColor: '#0a0f1a',
      navigationBarTextStyle: 'white',
    })
  : {
      navigationBarTitleText: '任务调度',
      navigationBarBackgroundColor: '#0a0f1a',
      navigationBarTextStyle: 'white',
    };
