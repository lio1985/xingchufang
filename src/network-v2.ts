import Taro from '@tarojs/taro'

declare const PROJECT_DOMAIN: string;

const createUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    let env: string | undefined;
    try {
        env = Taro.getEnv();
    } catch (e) {}

    const isH5 = (
        (env && env !== Taro.ENV_TYPE.WEAPP && isBrowser) ||
        (typeof process !== 'undefined' && process.env.TARO_ENV === 'h5') ||
        isBrowser
    );

    if (isH5) {
        const isCozeDev = isBrowser && window.location.hostname.includes('dev.coze.site');
        if (isCozeDev) {
            return url;
        }
        return `http://localhost:3000${url}`;
    }

    // 小程序环境：强制使用 HTTPS 域名
    if (env === Taro.ENV_TYPE.WEAPP) {
        return `https://api.xingchufang.cn${url}`;
    }

    return projectDomain ? `${projectDomain}${url}` : url;
}

export const request: typeof Taro.request = option => {
    const token = Taro.getStorageSync('token');
    const header = option.header || {};
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

export const Network = {
    request,
    uploadFile,
    downloadFile
}
