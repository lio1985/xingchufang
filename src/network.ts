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

// 缓存环境信息，避免重复计算
let cachedEnv: {
    isWeapp: boolean;
    isH5: boolean;
    isLocalhost: boolean;
    isCozeDev: boolean;
    projectDomain: string;
} | null = null;

const getEnvInfo = () => {
    if (cachedEnv) return cachedEnv;

    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

    let env: string | undefined;
    try {
        env = Taro.getEnv();
    } catch (e) {
        // Taro.getEnv() 可能出错
    }

    const projectDomain = typeof PROJECT_DOMAIN !== 'undefined' ? PROJECT_DOMAIN : '';

    const isWeapp = env === Taro.ENV_TYPE.WEAPP;
    const isH5 = (env && env !== Taro.ENV_TYPE.WEAPP && isBrowser) ||
        (typeof process !== 'undefined' && process.env.TARO_ENV === 'h5') ||
        isBrowser;
    const isLocalhost = isBrowser && window.location.hostname.includes('localhost');
    const isCozeDev = isBrowser && (
        window.location.hostname.includes('dev.coze.site') ||
        window.location.hostname.includes('bypass-')
    );

    cachedEnv = {
        isWeapp,
        isH5,
        isLocalhost,
        isCozeDev,
        projectDomain
    };

    return cachedEnv;
};

const createUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    const envInfo = getEnvInfo();

    // 小程序环境（微信小程序）- 优先判断
    if (envInfo.isWeapp) {
        // 使用 PROJECT_DOMAIN 或默认域名
        const domain = envInfo.projectDomain || 'https://api.xingchufang.cn';
        return `${domain}${url}`;
    }

    // H5/Web 环境
    if (envInfo.isH5) {
        // 本地开发环境：使用相对路径由 Vite 代理处理
        if (envInfo.isLocalhost) {
            return url;
        }

        // Coze/Bypass 沙箱环境：使用相对路径让 Vite 代理处理
        if (envInfo.isCozeDev) {
            return url;
        }

        // 其他 H5 环境：直接访问后端 API 端口 3000
        return `http://localhost:3000${url}`;
    }

    // 其他环境，默认使用环境变量或相对路径
    return envInfo.projectDomain ? `${envInfo.projectDomain}${url}` : url;
}

// 仅在开发环境输出调试日志
const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export const request: typeof Taro.request = option => {
    const token = Taro.getStorageSync('token');
    const header = option.header || {};

    // 如果存在 token，添加到请求头
    if (token) {
        header['Authorization'] = `Bearer ${token}`;
    }

    // 仅开发环境输出日志，且不输出敏感信息
    if (isDev) {
        console.log('[Network] Request:', {
            url: createUrl(option.url),
            method: option.method || 'GET',
            hasToken: !!token,
        });
    }

    const task = Taro.request({
        ...option,
        url: createUrl(option.url),
        header,
    });

    // 仅开发环境输出响应日志
    if (isDev) {
        task.then(response => {
            console.log('[Network] Response:', {
                url: createUrl(option.url),
                statusCode: response.statusCode,
            });
        }).catch(error => {
            console.error('[Network] Error:', {
                url: createUrl(option.url),
                error: error.errMsg || error.message || error
            });
        });
    }

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
