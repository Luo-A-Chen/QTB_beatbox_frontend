import axios from 'axios'
import { useUserStore } from './store';

// 全局请求拦截器
export const api = axios.create({
    baseURL: 'http://localhost:8080', // 本地环境
    // baseURL: '/api', // 线上代理环境
    // baseURL: 'http://47.105.118.0:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 添加token验证函数
const validateToken = async (): Promise<boolean> => {
    const userStore = useUserStore();
    if (!userStore.token) {
        return false;
    }
    
    try {
        // 这里可以添加token验证逻辑，比如调用后端验证接口
        // 暂时先返回true，由后端返回错误时再处理
        return true;
    } catch (error) {
        console.error('Token验证失败:', error);
        return false;
    }
}

api.interceptors.request.use(
    async (config) => {
        const userStore = useUserStore();
        const token = userStore.token;
        
        if (token) {
            // 检查token是否有效
            const isValid = await validateToken();
            if (!isValid) {
                // 清除无效token
                userStore.logout();
                // 如果是需要认证的请求，重定向到登录页
                if (config.url && !config.url.includes('/login') && !config.url.includes('/register')) {
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(new Error('Token已过期，请重新登录'));
                }
            } else {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
            const userStore = useUserStore();
            
            // 处理认证相关错误
            if (error.response.status === 401 || error.response.status === 403) {
                console.warn('Token无效或过期，清除本地状态');
                userStore.logout();
                
                // 避免在登录页面重复重定向
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    // 显示提示信息 - 使用console.warn替代window.$message
                    console.warn('登录状态已过期，请重新登录');
                    // 延迟重定向，避免在请求拦截中立即跳转
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                }
                
                return Promise.reject(new Error('认证失败，请重新登录'));
            }
            
            // 处理其他错误
            if (error.response.status === 404) {
                console.error('接口不存在:', error.config.url);
            } else if (error.response.status >= 500) {
                console.error('服务器错误:', error.response.status);
            }
        } else {
            console.error('Network Error:', error.message);
            // 网络错误处理
            if (error.message.includes('Network Error')) {
                console.error('网络连接失败，请检查网络连接');
            }
        }
        return Promise.reject(error);
    }
);

// 导出token验证函数供外部使用
export { validateToken };