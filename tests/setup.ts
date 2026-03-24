/**
 * Jest 测试环境配置
 */

// Mock Taro 全局对象
global.Taro = {
  showToast: jest.fn(),
  showModal: jest.fn(),
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  reLaunch: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  getEnv: jest.fn(() => ({ ENV_TYPE: { WEAPP: 'weapp' } })),
  login: jest.fn(),
  request: jest.fn(),
  uploadFile: jest.fn(),
  downloadFile: jest.fn(),
  chooseImage: jest.fn(),
  chooseMessageFile: jest.fn(),
  getFileInfo: jest.fn(),
  openDocument: jest.fn(),
  previewImage: jest.fn(),
  createSelectorQuery: jest.fn(() => ({
    select: jest.fn(() => ({
      boundingClientRect: jest.fn(() => ({
        exec: jest.fn(),
      })),
    })),
  })),
  createSelectorQuery: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    boundingClientRect: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
  })),
};

// Mock 全局定时器
global.setTimeout = jest.fn((fn, delay) => {
  return setTimeout(fn, delay);
}) as any;

global.setInterval = jest.fn((fn, delay) => {
  return setInterval(fn, delay);
}) as any;

global.clearTimeout = jest.fn() as any;

global.setInterval = jest.fn() as any;

global.clearInterval = jest.fn() as any;
