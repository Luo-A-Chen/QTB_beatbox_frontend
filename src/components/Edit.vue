<template>
  <div class="edit-profile-container">
    <a-spin :spinning="loading">
      <a-card style="max-width: 600px; margin: 0 auto;">
        <template #title>
          <div style="display: flex; align-items: center; gap: 8px;">
            <a-button type="text" @click="goBack" style="padding: 0; height: auto;">
              <arrow-left-outlined />
            </a-button>
            <span>基本信息</span>
          </div>
        </template>
        <a-form :model="user" layout="vertical">
          <!-- 头像上传 -->
          <a-form-item label="头像">
            <div style="display:flex; align-items: center; gap:16px;">
              <a-avatar 
                :src="user.avatar" 
                :size="64"
                style="margin-right: 10px;"
              >
                {{ user.name?.charAt(0) || 'U' }}
              </a-avatar>
              
              <div style="flex: 1;">
                <div style="font-weight: bold; margin-bottom: 8px;">{{ user.name || '用户' }}</div>
                <a-upload
                    name="avatar"
                    :show-upload-list="false"
                    :custom-request="handleAvatarUpload"
                    accept="image/*"
                    :disabled="avatarUploading"
                >
                  <a-button :loading="avatarUploading">
                    <template #icon><upload-outlined /></template>
                    {{ avatarUploading ? '上传中...' : '上传头像' }}
                  </a-button>
                </a-upload>
                <div class="form-tip">支持 JPG、PNG 格式，大小不超过 5MB</div>
              </div>
            </div>
          </a-form-item>
          
          <!-- 用户名 -->
          <a-form-item label="用户名" required>
            <a-input
                v-model:value="user.name"
                placeholder="请输入用户名"
                :maxlength="20"
                allow-clear
            />
            <div class="form-tip">最多20个字符</div>
          </a-form-item>
          
          <!-- 邮箱 -->
          <a-form-item label="邮箱">
            <a-input
                v-model:value="user.email"
                placeholder="请输入邮箱"
                type="email"
                allow-clear
            />
            <div class="form-tip">请输入有效的邮箱地址</div>
          </a-form-item>
          
          <!-- 个人简介 -->
          <a-form-item label="个人简介">
            <a-textarea
                v-model:value="user.profile"
                placeholder="请输入个人简介"
                :rows="4"
                :maxlength="200"
                show-count
                allow-clear
            />
          </a-form-item>
          
          <!-- 操作按钮 -->
          <a-form-item>
            <div style="display: flex; gap: 12px; justify-content: flex-end;">
              <a-button @click="goBack">
                取消
              </a-button>
              <a-button 
                type="primary" 
                @click="handleSubmit"
                :loading="loading"
              >
                {{ loading ? '保存中...' : '保存修改' }}
              </a-button>
            </div>
          </a-form-item>
        </a-form>
      </a-card>
    </a-spin>
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
    
    // 更新头像URL
    user.avatar = response.data.avatarUrl || response.data.url;
    message.success('头像上传成功');
    
    // 更新store中的用户信息
    userStore.setUserInfo({ ...user });
    
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
.edit-profile-container{
  padding: 20px;
  min-height: 80vh;
}

:deep(.ant-card) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  line-height: 1.4;
}

/* 头像区域样式 */
:deep(.ant-avatar) {
  border: 2px solid #f0f0f0;
  transition: border-color 0.3s;
}

:deep(.ant-avatar:hover) {
  border-color: #1890ff;
}

/* 上传按钮样式 */
:deep(.ant-upload) {
  display: inline-block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .edit-profile-container {
    padding: 16px;
  }
  
  :deep(.ant-card) {
    margin: 0;
    border-radius: 0;
  }
}
</style>