import Taro from '@tarojs/taro'

// 全局环境变量声明（由 defineConstants 注入）
declare const PROJECT_DOMAIN: string;

/**
 * 网络请求模块
 * 封装 Taro.request、Taro.uploadFile、Taro.downloadFile，自动添加项目域名前缀
 * 如果请求的 url 以 http:// 或 https:// 开头，则不会添加域名前缀
 *
 * IMPORTANT: 项目已经全局注入 PROJECT_DOMAIN
 * IMPORTANT: 除非你需要添加全局参数，如给所有请求加上 header，否则不能修改此文件
 */

const createUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    // 判断是否在浏览器/H5环境
    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    
    // 使用 Taro.getEnv() 判断环境
    let env: string | undefined;
    try {
        env = Taro.getEnv();
    } catch (e) {
        // Taro.getEnv() 可能出错
    }

    // H5/Web 环境判断：
    const isH5 = (
        (env && env !== Taro.ENV_TYPE.WEAPP && isBrowser) ||
        (typeof process !== 'undefined' && process.env.TARO_ENV === 'h5') ||
        isBrowser
    );

    // 从环境变量获取项目域名（通过 defineConstants 注入）
    const projectDomain = typeof PROJECT_DOMAIN !== 'undefined' 
        ? PROJECT_DOMAIN 
        : '';

    if (isH5) {
        // 检查是否在 Coze 在线预览环境
        const isCozeDev = isBrowser && window.location.hostname.includes('dev.coze.site');

        // Coze 在线预览环境：使用相对路径，由 Vite 代理处理
        if (isCozeDev) {
            return url;
        }

        // 本地 H5 开发环境：直接访问后端 API 端口 3000
        return `http://localhost:3000${url}`;
    }

    // 小程序环境（微信小程序）
    if (env === Taro.ENV_TYPE.WEAPP) {
        // 使用 HTTPS 域名
        return `https://api.xingchufang.cn${url}`;
    }

    // 其他环境，默认使用环境变量或相对路径
    return projectDomain ? `${projectDomain}${url}` : url;
}

export const request: typeof Taro.request = option => {
    const token = Taro.getStorageSync('token');
    const header = option.header || {};

    // 如果存在 token，添加到请求头
    if (token) {
        header['Authorization'] = `Bearer ${token}`;
    }

    console.log('Network Request:', {
        url: createUrl(option.url),
        method: option.method || 'GET',
        hasToken: !!token,
        token: token ? `${token.substring(0, 20)}...` : 'none',
        header,
        data: option.data
    });

    const task = Taro.request({
        ...option,
        url: createUrl(option.url),
        header,
    });

    // 监听响应完成，打印日志
    task.then(response => {
        console.log('Network Response:', {
            url: createUrl(option.url),
            statusCode: response.statusCode,
            data: response.data
        });
    }).catch(error => {
        console.error('Network Error:', {
            url: createUrl(option.url),
            error: error.errMsg || error.message || error
        });
    });

    return task;
}

export const uploadFile: typeof Taro.uploadFile = option => {
    const token = Taro.getStorageSync('token');
    const header = option.header || {};

    // 如果存在 token，添加到请求头
    if (token) {
        header['Authorization'] = `Bearer ${token}`;
    }

    return Taro.uploadFile({
        ...option,
        url: createUrl(option.url),
        header,
    })
}

export const downloadFile: typeof Taro.downloadFile = option => {
    return Taro.downloadFile({
        ...option,
        url: createUrl(option.url),
    })
}

// 为了保持向后兼容，保留 Network 对象
export const Network = {
    request,
    uploadFile,
    downloadFile
}
