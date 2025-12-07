import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import Register from '../components/Register.vue'
import Edit from "../components/Edit.vue";
import Video from "../components/Video.vue";
import { useUserStore } from '../store';

//路由配置
const routes=[
    { path:'/',component:Home, meta: { requiresAuth: true } },
    { path:'/login',component:Login, meta: { requiresAuth: false } },
    { path:'/register',component:Register, meta: { requiresAuth: false } },
    { path:'/edit',component:Edit, meta: { requiresAuth: true } },
    { path:'/video',component:Video, meta: { requiresAuth: true } },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

// 路由导航守卫
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    
    // 检查路由是否需要认证
    if (to.meta.requiresAuth) {
        if (userStore.isLoggedIn) {
            // 用户已登录，允许访问
            next();
        } else {
            // 用户未登录，重定向到登录页
            console.log('未登录用户尝试访问受保护页面:', to.path);
            next('/login');
        }
    } else {
        // 不需要认证的路由，直接允许访问
        next();
    }
});

// 路由错误处理
router.onError((error) => {
    console.error('路由错误:', error);
});

export default router;
