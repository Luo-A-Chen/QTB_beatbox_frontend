<script setup lang="ts">
import { api } from "../auth.ts";
import router from "../router";
import { message } from "ant-design-vue";
import { useUserStore } from "../store.ts";
import { reactive, ref } from "vue";
import { 
  UserOutlined, 
  LockOutlined, 
  PlayCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined 
} from '@ant-design/icons-vue';

const userStore = useUserStore();
const loading = ref(false);
const showPassword = ref(false);

const userData = reactive({
  account: '',
  password: '',
});

const handleLogin = async () => {
  if (userData.account.length < 6 || userData.account.length > 20) {
    message.error('账号长度需在 6~20 位之间');
    return;
  }
  if (userData.password.length < 6 || userData.password.length > 20) {
    message.error('密码长度需在 6~20 位之间');
    return;
  }
  
  loading.value = true;
  try {
    const result = await api.post('/user/login', {
      account: userData.account,
      password: userData.password,
    });

    if (result) {
      userStore.setToken(result.data.token);
      userStore.userInfo = result.data;
      message.success('登录成功！');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  } catch (e) {
    message.error('登录失败，请检查账号密码');
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  router.push('/register');
};

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="modern-login-page">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <!-- 主要内容 -->
    <div class="login-container">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo" @click="goToHome">
            <PlayCircleOutlined class="logo-icon" />
            <span class="logo-text">BeatBox Hub</span>
          </div>
          <h1 class="brand-title">欢迎回来</h1>
          <p class="brand-subtitle">登录您的账户，继续您的 Beatbox 之旅</p>
          
          <!-- 特色功能展示 -->
          <div class="features">
            <div class="feature-item">
              <div class="feature-icon">🎵</div>
              <div class="feature-text">
                <h4>海量视频</h4>
                <p>观看精彩的 Beatbox 表演</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎤</div>
              <div class="feature-text">
                <h4>分享创作</h4>
                <p>上传您的原创作品</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">👥</div>
              <div class="feature-text">
                <h4>社区交流</h4>
                <p>与全球 Beatboxer 互动</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h2>登录账户</h2>
            <p>请输入您的登录信息</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <!-- 账号输入 -->
            <div class="form-group">
              <label class="form-label">账号</label>
              <a-input
                v-model:value="userData.account"
                placeholder="请输入账号"
                size="large"
                class="modern-input"
                :maxlength="20"
              >
                <template #prefix>
                  <UserOutlined class="input-icon" />
                </template>
              </a-input>
            </div>

            <!-- 密码输入 -->
            <div class="form-group">
              <label class="form-label">密码</label>
              <a-input
                v-model:value="userData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                size="large"
                class="modern-input"
                :maxlength="20"
              >
                <template #prefix>
                  <LockOutlined class="input-icon" />
                </template>
                <template #suffix>
                  <div class="password-toggle" @click="showPassword = !showPassword">
                    <EyeOutlined v-if="!showPassword" />
                    <EyeInvisibleOutlined v-else />
                  </div>
                </template>
              </a-input>
            </div>

            <!-- 登录按钮 -->
            <a-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              class="login-btn"
              block
            >
              {{ loading ? '登录中...' : '登录' }}
            </a-button>

            <!-- 注册链接 -->
            <div class="form-footer">
              <span class="footer-text">还没有账号？</span>
              <a @click="goToRegister" class="register-link">立即注册</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式 */
.modern-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 主容器 */
.login-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  min-height: 600px;
}

/* 左侧品牌区域 */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.brand-content {
  max-width: 400px;
}

.brand-logo {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 40px;
  margin-right: 12px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
}

.brand-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 40px 0;
  line-height: 1.5;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.feature-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-text h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.feature-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

/* 右侧表单区域 */
.form-section {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #262626;
}

.form-header p {
  font-size: 16px;
  color: #8c8c8c;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.modern-input {
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.modern-input:hover {
  border-color: #d9d9d9;
}

.modern-input:focus,
.modern-input:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.input-icon {
  color: #bfbfbf;
  font-size: 16px;
}

.password-toggle {
  cursor: pointer;
  color: #bfbfbf;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #1890ff;
}

.login-btn {
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
}

.form-footer {
  text-align: center;
  margin-top: 8px;
}

.footer-text {
  color: #8c8c8c;
  font-size: 14px;
}

.register-link {
  color: #1890ff;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-container {
    max-width: 900px;
  }
  
  .brand-section,
  .form-section {
    padding: 40px 30px;
  }
}

@media (max-width: 768px) {
  .modern-login-page {
    padding: 20px;
  }
  
  .login-container {
    flex-direction: column;
    max-width: 500px;
    min-height: auto;
  }
  
  .brand-section {
    padding: 40px 30px 30px;
    text-align: center;
  }
  
  .brand-title {
    font-size: 28px;
  }
  
  .brand-subtitle {
    font-size: 16px;
  }
  
  .features {
    flex-direction: row;
    justify-content: space-around;
    margin-top: 20px;
  }
  
  .feature-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .feature-text h4 {
    font-size: 14px;
  }
  
  .feature-text p {
    font-size: 12px;
  }
  
  .form-section {
    padding: 30px;
  }
  
  .form-header h2 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .modern-login-page {
    padding: 10px;
  }
  
  .login-container {
    border-radius: 16px;
  }
  
  .brand-section,
  .form-section {
    padding: 24px 20px;
  }
  
  .features {
    gap: 16px;
  }
  
  .feature-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>
