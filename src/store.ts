import { defineStore } from 'pinia';

//用户状态管理
export const useUserStore = defineStore('user', {
    state:()=>({
        token: localStorage.getItem('UserToken') as string || '',
        userInfo: (() => {
            try {
                const userInfoStr = localStorage.getItem('UserInfo');
                if (!userInfoStr || userInfoStr === 'null' || userInfoStr === 'undefined') {
                    return null;
                }
                return JSON.parse(userInfoStr);
            } catch (error) {
                console.error('解析用户信息失败:', error);
                localStorage.removeItem('UserInfo'); // 清除无效数据
                return null;
            }
        })() as any | null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.token,
    },
    actions:{
        setToken(token: string) {
            this.token = token
            localStorage.setItem('UserToken', token)
        },
        setUserInfo(info: any) {
            // 确保头像URL正确存储
            if (info && typeof info === 'object') {
                // 清理可能存在的无效头像URL
                if (info.avatar === null || info.avatar === undefined || info.avatar === '') {
                    delete info.avatar;
                }
                
                // 确保所有必要字段都存在
                const userInfo = {
                    id: info.id || '',
                    name: info.name || '',
                    avatar: info.avatar || '',
                    email: info.email || '',
                    profile: info.profile || '',
                    account: info.account || ''
                };
                
                this.userInfo = userInfo;
                localStorage.setItem('UserInfo', JSON.stringify(userInfo));
            } else {
                this.userInfo = null;
                localStorage.setItem('UserInfo', JSON.stringify(null));
            }
        },
        logout() {
            this.token = ''
            this.userInfo = null
            localStorage.removeItem('UserToken')
            localStorage.removeItem('UserInfo')
        }
    }
});