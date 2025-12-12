<script setup lang="ts">
import { reactive, ref } from 'vue';
import { api } from '../auth';
import router from "../router";
import { message } from "ant-design-vue";
import { 
  UserOutlined, 
  LockOutlined, 
  PlayCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons-vue';

const userData = reactive({
  account: '',
  password: '',
  checkPassword: ''
});

const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const handleRegister = async () => {
  if (userData.account.length < 6 || userData.account.length > 20) {
    message.error('用户名长度需在 6~20 位之间');
    return;
  }
  if (userData.password.length < 6 || userData.password.length > 20) {
    message.error('密码长度需在 6~20 位之间');
    return;
  }
  if (userData.password !== userData.checkPassword) {
    message.error('两次输入的密码不一致');
    return;
  }
  
  loading.value = true;
  try {
    await api.post('/user/register', {
      account: userData.account,
      password: userData.password,
      checkPassword: userData.checkPassword
    });
    message.success('注册成功！即将跳转到登录页面');
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  } catch (error) {
    message.error('注册失败，请重试');
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <div class="modern-register-page">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <!-- 主要内容 -->
    <div class="register-container">
      <!-- 左侧表单区域 -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <div class="brand-logo" @click="goToHome">
              <PlayCircleOutlined class="logo-icon" />
              <span class="logo-text">BeatBox Hub</span>
            </div>
            <h2>创建账户</h2>
            <p>加入我们的 Beatbox 社区</p>
          </div>

          <form class="register-form" @submit.prevent="handleRegister">
            <!-- 账号输入 -->
            <div class="form-group">
              <label class="form-label">用户名</label>
              <a-input
                v-model:value="userData.account"
                placeholder="请输入用户名（6-20位字符）"
                size="large"
                class="modern-input"
                :maxlength="20"
              >
                <template #prefix>
                  <UserOutlined class="input-icon" />
                </template>
              </a-input>
              <div class="input-tip">用户名将作为您在平台上的唯一标识</div>
            </div>

            <!-- 密码输入 -->
            <div class="form-group">
              <label class="form-label">密码</label>
              <a-input
                v-model:value="userData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码（6-20位字符）"
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
              <div class="input-tip">建议使用字母、数字和符号的组合</div>
            </div>

            <!-- 确认密码输入 -->
            <div class="form-group">
              <label class="form-label">确认密码</label>
              <a-input
                v-model:value="userData.checkPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次输入密码"
                size="large"
                class="modern-input"
                :maxlength="20"
              >
                <template #prefix>
                  <CheckCircleOutlined class="input-icon" />
                </template>
                <template #suffix>
                  <div class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                    <EyeOutlined v-if="!showConfirmPassword" />
                    <EyeInvisibleOutlined v-else />
                  </div>
                </template>
              </a-input>
              <div class="input-tip" :class="{ 'error': userData.checkPassword && userData.password !== userData.checkPassword }">
                {{ userData.checkPassword && userData.password !== userData.checkPassword ? '密码不一致' : '请确保两次输入的密码相同' }}
              </div>
            </div>

            <!-- 注册按钮 -->
            <a-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleRegister"
              class="register-btn"
              block
            >
              {{ loading ? '注册中...' : '创建账户' }}
            </a-button>

            <!-- 登录链接 -->
            <div class="form-footer">
              <span class="footer-text">已有账号？</span>
              <a @click="goToLogin" class="login-link">立即登录</a>
            </div>
          </form>
        </div>
      </div>

      <!-- 右侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <h1 class="brand-title">开始您的创作之旅</h1>
          <p class="brand-subtitle">加入全球 Beatbox 爱好者社区，分享您的才华</p>
          
          <!-- 注册优势 -->
          <div class="benefits">
            <div class="benefit-item">
              <div class="benefit-icon">🎬</div>
              <div class="benefit-text">
                <h4>上传作品</h4>
                <p>分享您的 Beatbox 表演视频</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">💬</div>
              <div class="benefit-text">
                <h4>互动交流</h4>
                <p>与其他创作者交流学习</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">🏆</div>
              <div class="benefit-text">
                <h4>参与比赛</h4>
                <p>展示技巧，赢取奖励</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">📈</div>
              <div class="benefit-text">
                <h4>成长记录</h4>
                <p>记录您的进步历程</p>
              </div>
            </div>
          </div>

          <!-- 统计数据 -->
          <div class="stats">
            <div class="stat-item">
              <div class="stat-number">10K+</div>
              <div class="stat-label">活跃用户</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">50K+</div>
              <div class="stat-label">精彩视频</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">100+</div>
              <div class="stat-label">国家地区</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式 */
.modern-register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
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
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 180px;
  height: 180px;
  top: 15%;
  right: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 120px;
  height: 120px;
  bottom: 20%;
  right: 20%;
  animation-delay: 3s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 5%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(180deg); }
}

/* 主容器 */
.register-container {
  display: flex;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  min-height: 700px;
}

/* 左侧表单区域 */
.form-section {
  flex: 1;
  padding: 40px;
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

.brand-logo {
  display: inline-flex;
  align-items: center;
  margin-bottom: 24px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 32px;
  margin-right: 8px;
  color: #1890ff;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #1890ff, #722ed1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

.register-form {
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

.input-tip {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
}

.input-tip.error {
  color: #ff4d4f;
}

.register-btn {
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.register-btn:hover {
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

.login-link {
  color: #1890ff;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 右侧品牌区域 */
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

.benefits {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.benefit-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.benefit-text h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.benefit-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

.stats {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .register-container {
    max-width: 900px;
  }
  
  .form-section,
  .brand-section {
    padding: 40px 30px;
  }
}

@media (max-width: 768px) {
  .modern-register-page {
    padding: 20px;
  }
  
  .register-container {
    flex-direction: column-reverse;
    max-width: 500px;
    min-height: auto;
  }
  
  .brand-section {
    padding: 30px;
    text-align: center;
  }
  
  .brand-title {
    font-size: 28px;
  }
  
  .brand-subtitle {
    font-size: 16px;
  }
  
  .benefits {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 30px;
  }
  
  .benefit-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .benefit-text h4 {
    font-size: 14px;
  }
  
  .benefit-text p {
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
  .modern-register-page {
    padding: 10px;
  }
  
  .register-container {
    border-radius: 16px;
  }
  
  .brand-section,
  .form-section {
    padding: 24px 20px;
  }
  
  .benefits {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .benefit-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
  
  .stats {
    gap: 16px;
  }
  
  .stat-number {
    font-size: 20px;
  }
}
</style>