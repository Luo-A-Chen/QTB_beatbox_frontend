<template>
  <div class="modern-edit-profile">
    <!-- 顶部导航 -->
    <header class="edit-header">
      <div class="header-container">
        <div class="header-left">
          <a-button type="text" @click="goBack" class="back-btn">
            <ArrowLeftOutlined />
          </a-button>
          <div class="header-title">
            <h1>编辑个人资料</h1>
            <p>完善您的个人信息，让更多人了解您</p>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <div class="edit-container">
      <a-spin :spinning="loading" class="loading-wrapper">
        <div class="edit-content">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <div class="avatar-card">
              <div class="avatar-wrapper">
                <a-avatar :src="user.avatar" :size="120" class="user-avatar">
                  {{ user.name?.charAt(0) || 'U' }}
                </a-avatar>
                <div class="avatar-overlay">
                  <a-upload
                    name="avatar"
                    :show-upload-list="false"
                    :custom-request="handleAvatarUpload"
                    accept="image/*"
                    :disabled="avatarUploading"
                    class="avatar-upload"
                  >
                    <div class="upload-trigger">
                      <UploadOutlined />
                      <span>更换头像</span>
                    </div>
                  </a-upload>
                </div>
              </div>
              <div class="avatar-info">
                <h3>{{ user.name || '用户' }}</h3>
                <p class="avatar-tip">支持 JPG、PNG 格式，建议尺寸 200x200px，大小不超过 5MB</p>
              </div>
            </div>
          </div>

          <!-- 表单区域 -->
          <div class="form-section">
            <div class="form-card">
              <h2 class="form-title">基本信息</h2>
              <a-form :model="user" layout="vertical" class="profile-form">
                <!-- 用户名 -->
                <a-form-item label="用户名" class="form-item">
                  <a-input
                    v-model:value="user.name"
                    placeholder="请输入用户名"
                    :maxlength="20"
                    show-count
                    size="large"
                    class="modern-input"
                  />
                  <div class="field-tip">这是您在平台上的显示名称</div>
                </a-form-item>
                
                <!-- 邮箱 -->
                <a-form-item label="邮箱地址" class="form-item">
                  <a-input
                    v-model:value="user.email"
                    placeholder="请输入邮箱地址"
                    type="email"
                    size="large"
                    class="modern-input"
                  />
                  <div class="field-tip">用于接收重要通知和找回密码</div>
                </a-form-item>
                
                <!-- 个人简介 -->
                <a-form-item label="个人简介" class="form-item">
                  <a-textarea
                    v-model:value="user.profile"
                    placeholder="介绍一下您自己，让其他用户更好地了解您..."
                    :rows="4"
                    :maxlength="200"
                    show-count
                    class="modern-textarea"
                  />
                  <div class="field-tip">简单介绍您的 Beatbox 经历或特长</div>
                </a-form-item>
              </a-form>
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div class="action-bar">
          <div class="action-container">
            <a-button size="large" @click="goBack" class="cancel-btn">
              取消
            </a-button>
            <a-button 
              type="primary" 
              size="large"
              @click="handleSubmit"
              :loading="loading"
              class="save-btn"
            >
              {{ loading ? '保存中...' : '保存修改' }}
            </a-button>
          </div>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../store';
import {message} from "ant-design-vue";
import {reactive,onMounted,ref} from "vue";
import router from '../router';
import {api} from "../auth.ts";
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue';

const userStore = useUserStore();
const loading = ref(false);
const avatarUploading = ref(false);

const user=reactive({
    id:'',
    name:'',
    avatar:'',
    email:'',
    profile:'',
    account: ''
});

// 加载用户信息
onMounted(async ()=>{
  try {
    loading.value = true;
    
    // 优先从store获取用户信息（刷新后从localStorage恢复）
    if (userStore.userInfo) {
      Object.assign(user, userStore.userInfo);
    }
    
    // 如果store中没有用户信息，检查是否登录
    if (!userStore.isLoggedIn) {
      message.error('请先登录');
      router.push('/login');
      return;
    }
    
    // 从后端获取最新信息
    const response = await api.get('/user/getUser');
    if (response.data) {
      Object.assign(user, response.data);
      // 更新store中的用户信息（同时保存到localStorage）
      userStore.setUserInfo(response.data);
    }
    
  } catch (err: any) {
    console.error('加载用户信息失败:', err);
    
    // 如果后端请求失败，但store中有数据，继续显示
    if (userStore.userInfo && userStore.userInfo !== null && typeof userStore.userInfo === 'object') {
      Object.assign(user, userStore.userInfo);
      message.warning('使用本地缓存数据，部分信息可能不是最新的');
    } else {
      message.error('加载用户信息失败');
      if (err.response?.status === 401) {
        router.push('/login');
      }
    }
  } finally {
    loading.value = false;
  }
})

// 处理头像上传
const handleAvatarUpload = async (info: any) => {
  const file = info.file;
  
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    message.error('请上传图片文件');
    return;
  }
  
  // 检查文件大小（限制为5MB）
  if (file.size > 5 * 1024 * 1024) {
    message.error('图片大小不能超过5MB');
    return;
  }
  
  try {
    avatarUploading.value = true;
    
    // 创建FormData对象
    const formData = new FormData();
    formData.append('avatar', file);
    
    // 上传头像
    const response = await api.post('/user/uploadAvatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // 更新头像URL - 添加更多可能的字段名
    const avatarUrl = response.data.avatarUrl || response.data.url || response.data.avatar || response.data.imageUrl;
    
    if (!avatarUrl) {
      message.error('头像上传成功，但未获取到有效的头像URL');
      return;
    }
    
    user.avatar = avatarUrl;
    message.success('头像上传成功');
    
    // 更新store中的用户信息 - 确保所有字段都正确更新
    const updatedUserInfo = {
      ...userStore.userInfo,
      avatar: avatarUrl,
      name: user.name,
      email: user.email,
      profile: user.profile,
      id: user.id,
      account: user.account
    };
    userStore.setUserInfo(updatedUserInfo);
    
    // 强制触发页面重新渲染
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 100);
    
  } catch (err: any) {
    console.error('头像上传失败:', err);
    message.error('头像上传失败');
  } finally {
    avatarUploading.value = false;
  }
};

// 表单验证
const validateForm = () => {
  if (!user.name || user.name.trim().length === 0) {
    message.error('请输入用户名');
    return false;
  }
  
  if (user.name.length > 20) {
    message.error('用户名不能超过20个字符');
    return false;
  }
  
  if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    message.error('请输入有效的邮箱地址');
    return false;
  }
  
  if (user.profile && user.profile.length > 200) {
    message.error('个人简介不能超过200个字符');
    return false;
  }
  
  return true;
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    loading.value = true;
    const response = await api.post('/user/updateUser', user);
    
    message.success('个人信息更新成功');
    
    if(response.data){
      userStore.setUserInfo(response.data);
      Object.assign(user, response.data);
    }
    
    // 延迟跳转，让用户看到成功消息
    setTimeout(() => {
      router.push('/');
    }, 1000);
    
  } catch (err: any) {
    console.error('个人信息更新失败:', err);
    message.error('个人信息更新失败');
  } finally {
    loading.value = false;
  }
}

const goBack = () => {
  router.push('/');
};
</script>


<style scoped>
/* 全局样式 */
.modern-edit-profile {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航 */
.edit-header {
  background: white;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 80px;
  display: flex;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #595959;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #f0f0f0;
  color: #1890ff;
}

.header-title h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.header-title p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #8c8c8c;
}

/* 主要内容 */
.edit-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 120px;
}

.loading-wrapper {
  min-height: 400px;
}

.edit-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 32px;
  align-items: start;
}

/* 头像区域 */
.avatar-section {
  position: sticky;
  top: 120px;
}

.avatar-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.user-avatar {
  border: 4px solid #f0f0f0;
  transition: all 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-wrapper:hover .user-avatar {
  border-color: #1890ff;
}

.upload-trigger {
  color: white;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
}

.upload-trigger span {
  display: block;
  margin-top: 4px;
}

.avatar-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.avatar-tip {
  margin: 0;
  font-size: 13px;
  color: #8c8c8c;
  line-height: 1.5;
}

/* 表单区域 */
.form-section {
  min-width: 0;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.form-title {
  margin: 0 0 32px 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

.profile-form {
  max-width: 500px;
}

.form-item {
  margin-bottom: 32px;
}

.modern-input,
.modern-textarea {
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.modern-input:hover,
.modern-textarea:hover {
  border-color: #d9d9d9;
}

.modern-input:focus,
.modern-textarea:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.field-tip {
  margin-top: 8px;
  font-size: 13px;
  color: #8c8c8c;
  line-height: 1.4;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e8e8e8;
  padding: 16px 0;
  z-index: 100;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.action-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  border-radius: 8px;
  font-weight: 500;
  min-width: 100px;
}

.save-btn {
  border-radius: 8px;
  font-weight: 500;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

/* 表单标签样式 */
:deep(.ant-form-item-label > label) {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
}

/* 字符计数样式 */
:deep(.ant-input-show-count-suffix) {
  color: #bfbfbf;
}

:deep(.ant-input-textarea-show-count::after) {
  color: #bfbfbf;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .edit-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .avatar-section {
    position: static;
  }
  
  .avatar-card {
    padding: 24px;
  }
  
  .form-card {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    height: 64px;
  }
  
  .header-title h1 {
    font-size: 20px;
  }
  
  .edit-container {
    padding: 20px 16px 120px;
  }
  
  .avatar-card,
  .form-card {
    border-radius: 12px;
    padding: 20px;
  }
  
  .user-avatar {
    width: 100px !important;
    height: 100px !important;
  }
  
  .profile-form {
    max-width: none;
  }
  
  .action-container {
    padding: 0 16px;
  }
  
  .cancel-btn,
  .save-btn {
    flex: 1;
    max-width: 150px;
  }
}

@media (max-width: 480px) {
  .header-left {
    gap: 12px;
  }
  
  .header-title h1 {
    font-size: 18px;
  }
  
  .header-title p {
    display: none;
  }
  
  .user-avatar {
    width: 80px !important;
    height: 80px !important;
  }
}
</style>