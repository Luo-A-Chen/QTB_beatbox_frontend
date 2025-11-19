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
            this.userInfo = info
            localStorage.setItem('UserInfo', JSON.stringify(info))
        },
        logout() {
            this.token = ''
            this.userInfo = null
            localStorage.removeItem('UserToken')
            localStorage.removeItem('UserInfo')
        }
    }
});