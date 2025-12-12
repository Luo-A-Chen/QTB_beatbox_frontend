import axios from 'axios'
import { useUserStore } from './store';

// 全局请求拦截器
export const api = axios.create({
    baseURL: 'http://localhost:8080', // 本地环境
    // baseURL: '/api', // 线上代理环境
    // baseURL: 'http://47.105.118.0:8080',
    timeout: 10000
})
// 请求拦截器
api.interceptors.request.use(
    (config) => {
        const userStore = useUserStore();
        const token = userStore.token;
        if(token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);
// 响应拦截器
api.interceptors.response.use(
    (response) => response.data,
    
    (error) => {
        const userStore = useUserStore()
        if(error.response){
            const status = error.response.status
            if(status === 401 || status === 403){
                console.warn('登录状态失效')
                userStore.logout()

                // 避免重复跳转
                if(!['/login','/register'].includes(window.location.pathname)){
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                }
            }
            if(status === 404){
                console.error('接口不存在:', error.config.url);
            }
            if(status >= 500){
                console.error('服务器错误:', error.response.status);
            }
        }else{
            console.error('网络错误:', error.message);
        }
        return Promise.reject(error);
    }
)