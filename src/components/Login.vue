<script setup lang="ts">
import {api} from "../auth.ts";
import router from "../router";
import {message} from "ant-design-vue";
import {useUserStore} from "../store.ts";
import {reactive} from "vue";


const userStore = useUserStore();
const userData = reactive({
  account: '',
  password: '',
});
const handleLogin = async () => {
  if(userData.account.length < 6 || userData.account.length > 20) {
    alert('账号长度需在 6~20 位之间');
    return;
  }
  if(userData.password.length < 6 || userData.password.length > 20) {
    alert('密码长度需在 6~20 位之间');
    return;
  }
  try {
      const result=await api.post('/user/login', {
        account: userData.account,
        password: userData.password,
      });

      if(result){
        userStore.setToken(result.data.token);
        userStore.userInfo = result.data;
        setTimeout(()=>{
          router.push('/')
        },1000)
      }
  }catch (e) {
    message.error('登录失败,请重试');
  }
};
const goToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="Login-container">
    <h2>登录页面</h2>
    <form>
      <a-input v-model:value="userData.account" placeholder="账号" />
      <a-input v-model:value="userData.password" placeholder="密码" type="password" />
      <a-button type="primary" @click="handleLogin">登录</a-button>

      <div class="register-link">
        <span>没有账号？</span>
        <a href="javascript:void(0);" @click="goToRegister" class="register-text">去注册</a>
      </div>
    </form>
  </div>
</template>
<style scoped>

.Login-container {
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  padding-bottom: 40px;
}
.register-link {
  position: absolute; /* 绝对定位 */
  right: 0; /* 距离form右侧0px */
  bottom: 0; /* 距离form底部0px */
  text-align: right; /* 文本右对齐 */
  font-size: 14px;
  color: #666;
  margin-top: 8px; /* 与上方元素保持间距 */
}
.register-text {
  color: #1890ff;
  text-decoration: none;
  cursor: pointer;
  margin-left: 4px;
}

.register-text:hover {
  color: #40a9ff;
  text-decoration: underline;
}
.a-input, .a-button {
  width: 100%;
}
</style>
