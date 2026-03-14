import Taro from '@tarojs/taro'

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

    // 检查是否在 Coze 在线预览环境
    const isCozeDev = typeof window !== 'undefined' && 
                      window.location.hostname.includes('dev.coze.site');
    
    // Coze 在线预览环境：使用相对路径，由代理处理
    if (isCozeDev) {
        return url;
    }

    // 更可靠的 H5 环境检测
    const isH5 = typeof window !== 'undefined' && typeof document !== 'undefined'
    
    // 本地 H5 开发环境：直接访问后端 API 端口 3000
    if (isH5) {
        return `http://localhost:3000${url}`
    }

    // 小程序线上环境：使用部署的服务器
    // 注意：需要在微信小程序后台配置服务器域名 https://api.xingchufang.cn
    return `https://api.xingchufang.cn${url}`
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
