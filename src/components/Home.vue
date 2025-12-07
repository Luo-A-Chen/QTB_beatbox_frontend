<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store';
import { api } from '../auth';
import { 
  PlayCircleOutlined, 
  FireOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  UploadOutlined
} from '@ant-design/icons-vue';
const router = useRouter();
const userStore = useUserStore();

// 定义后端返回的视频数据类型
interface VideoResponse {
  id: number; // 视频主键
  title: string; // 视频标题
  description: string; // 视频描述
  cover: string; // 视频封面
  videoUrl: string; // 视频地址
  duration: number; // 视频时长（秒）
  status: number; // 视频状态 0-处理中 1-正常 2-删除 3-处理失败
  type: number; // 视频类型 0-普通视频 1-广告视频
}

// 用户状态相关
const isLoggedIn = computed(() => userStore.isLoggedIn);
const userInfo = computed(() => userStore.userInfo || { name: '用户', avatar: '' });

// 编辑个人信息
const handleEditProfile = () => {
  router.push('/edit');
};

// 退出登录
const handleLogout = () => {
  userStore.logout();
  setTimeout(() => {
    router.push('/login');
  }, 0);
};

// 视频数据 - 初始为空数组，等待后端加载
const videoList = ref<VideoResponse[]>([]);
const loading = ref(false);

// 获取首页推荐视频列表
const fetchRecommendVideos = async () => {
  loading.value = true;
  try {
    console.log('开始请求推荐视频接口...');
    const response = await api.get('/home/recommend');
    console.log('接口响应:', response);
    
    // 检查后端返回的code是否为200
    if (response && response.data.code === 200) {
      videoList.value = response.data || [];
      console.log('成功获取推荐视频:', videoList.value.length, '个');
    } else {
      console.error('获取推荐视频失败:', response.data?.message || '未知错误');
    }
  } catch (error: any) {
    console.error('请求推荐视频接口失败:', error);
    console.error('错误详情:', error.response?.data?.message || error.message || '未知错误');
  } finally {
    loading.value = false;
  }
};

// 将后端duration（秒）转换为前端显示的格式（分:秒）
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// 为后端数据添加前端需要的字段
const processedVideoList = computed(() => {
  return videoList.value.map(video => ({
    ...video,
    // 添加前端需要的字段
    thumbnail: video.cover, // 后端cover对应前端thumbnail
    durationDisplay: formatDuration(video.duration), // 格式化时长显示
    views: '0', // 后端没有提供，暂时设为0
    likes: '0', // 后端没有提供，暂时设为0
    uploader: '未知上传者', // 后端没有提供
    category: '表演', // 后端没有提供，暂时设为默认值
    difficulty: '中级' // 后端没有提供，暂时设为默认值
  }));
});

const featuredVideos = ref(processedVideoList.value.slice(0, 3));
const categories = ref([
  { label: '全部', value: 'all' },
  { label: '教学', value: '教学' },
  { label: '表演', value: '表演' },
  { label: '挑战', value: '挑战' },
  { label: '技巧', value: '技巧' },
  { label: '创新', value: '创新' }
]);

const selectedCategory = ref('all');
const searchText = ref('');

// 过滤视频
const filteredVideos = ref([...processedVideoList.value]);

const filterVideos = () => {
  let filtered = [...processedVideoList.value];
  
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(video => video.category === selectedCategory.value);
  }
  
  if (searchText.value) {
    filtered = filtered.filter(video => 
      video.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
      video.uploader.toLowerCase().includes(searchText.value.toLowerCase())
    );
  }
  
  filteredVideos.value = filtered;
};

const playVideo = (video: any) => {
  // 在实际项目中，这里可以打开视频播放模态框
  console.log('播放视频:', video.title);
};

const likeVideo = (video: any) => {
  // 点赞功能
  console.log('点赞视频:', video.title);
};

const handleUploadVideo = () => {
  router.push('/video');
};

onMounted(() => {
  console.log('首页加载完成');
  // 加载后端数据
  fetchRecommendVideos();
});
</script>

<template>
  <a-layout class="home-layout">
    <!-- 头部 -->
    <a-layout-header class="header">
      <div class="header-content">
        <div class="logo">
          <PlayCircleOutlined class="logo-icon" />
          <span class="logo-text">Beatbox视频站</span>
        </div>
        
        <div class="search-bar">
          <a-input-search
            v-model:value="searchText"
            placeholder="搜索Beatbox视频..."
            @search="filterVideos"
            class="search-input"
          />
        </div>
        
        <div class="user-actions">
          <template v-if="isLoggedIn">
            <a-dropdown>
              <div style="display: flex; align-items: center; cursor: pointer;">
                <a-avatar :size="32" :src="userInfo.avatar">
                  {{ userInfo.name?.charAt(0) || 'U' }}
                </a-avatar>
                <span style="margin-left: 8px; color: white;">
                  {{ userInfo.name }}
                </span>
              </div>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="handleEditProfile">
                    <UserOutlined /> 编辑个人信息
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="handleUploadVideo">
                    <UploadOutlined /> 上传视频
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="handleLogout">
                    <LogoutOutlined /> 退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
          <template v-else>
            <router-link to="/login">
              <a-button type="primary" size="small">登录</a-button>
            </router-link>
            <router-link to="/register" style="margin-left: 8px;">
              <a-button type="primary" size="small">注册</a-button>
            </router-link>
          </template>
        </div>
      </div>
    </a-layout-header>

    <!-- 主要内容区域 -->
    <a-layout-content class="content">
      <!-- 分类导航 -->
      <div class="category-section">
        <a-card :bordered="false" class="category-card">
          <div class="category-tabs">
            <a-radio-group v-model:value="selectedCategory" @change="filterVideos" button-style="solid">
              <a-radio-button v-for="category in categories" :key="category.value" :value="category.value">
                {{ category.label }}
              </a-radio-button>
            </a-radio-group>
          </div>
        </a-card>
      </div>

      <!-- 主要内容布局 -->
      <div class="main-content">
        <!-- 左侧：热门推荐轮播图 -->
        <div class="left-section">
          <a-card class="featured-card" :bordered="false">
            <template #title>
              <div class="section-title">
                <FireOutlined class="title-icon" />
                <span>热门推荐</span>
              </div>
            </template>
            
            <a-spin :spinning="loading">
              <div v-if="featuredVideos.length > 0" class="carousel-container">
                <a-carousel autoplay arrows dots-class="slick-dots slick-thumb">
                  <div v-for="video in featuredVideos" :key="video.id" class="carousel-item">
                    <div class="carousel-video" @click="playVideo(video)">
                      <img :src="video.thumbnail" :alt="video.title" class="carousel-image" />
                      <div class="carousel-overlay">
                        <div class="video-info">
                          <h3 class="video-title">{{ video.title }}</h3>
                          <p class="video-meta">{{ video.uploader }} • {{ video.views }} 观看</p>
                          <div class="video-tags">
                            <a-tag color="blue">{{ video.category }}</a-tag>
                            <a-tag :color="video.difficulty === '高级' ? 'red' : video.difficulty === '中级' ? 'orange' : 'green'">
                              {{ video.difficulty }}
                            </a-tag>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a-carousel>
              </div>
              
              <div v-else-if="!loading" class="empty-state">
                <a-empty description="暂无推荐视频" />
              </div>
            </a-spin>
          </a-card>
        </div>

        <!-- 右侧：最新视频列表 -->
        <div class="right-section">
          <a-card :bordered="false" class="latest-videos-card">
            <template #title>
              <div class="section-title">
                <ClockCircleOutlined class="title-icon" />
                <span>最新视频</span>
                <span class="video-count">({{ filteredVideos.length }}个)</span>
              </div>
            </template>
            
            <a-spin :spinning="loading">
              <div v-if="filteredVideos.length > 0" class="video-grid">
                <div 
                  v-for="video in filteredVideos" 
                  :key="video.id"
                  class="video-item"
                  @click="playVideo(video)"
                >
                  <div class="video-thumbnail">
                    <img :src="video.thumbnail" :alt="video.title" />
                    <div class="video-duration">{{ video.durationDisplay }}</div>
                  </div>
                  <div class="video-content">
                    <h4 class="video-title">{{ video.title }}</h4>
                    <p class="video-uploader">{{ video.uploader }}</p>
                    <div class="video-stats">
                      <span class="views">{{ video.views }} 观看</span>
                      <div class="video-tags">
                        <a-tag size="small" color="blue">{{ video.category }}</a-tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else-if="!loading" class="empty-state">
                <a-empty description="暂无相关视频" />
              </div>
            </a-spin>
          </a-card>
        </div>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<style scoped>
.home-layout {
  min-height: 100vh;
  transform: translateZ(0);
}

.header {
  background: #001529;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 1000;
  transform: translateZ(0);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  transform: translateZ(0);
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
}

.search-bar {
  flex: 0 0 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.search-input {
  width: 100%;
}

.user-actions {
  display: flex;
  align-items: center;
}

.content {
  padding: 0 24px 24px;
  max-width: 1200px;
  margin: 0 auto;
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
}

.category-section {
  margin: 24px 0;
}

.category-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.category-tabs {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  align-items: start;
}

.left-section {
  min-height: 400px;
}

.right-section {
  position: sticky;
  top: 100px;
  height: fit-content;
}

.featured-card, .latest-videos-card {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
}

.title-icon {
  margin-right: 8px;
  color: #1890ff;
}

.video-count {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

/* 轮播图样式 */
.carousel-container {
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-item {
  height: 300px;
}

.carousel-video {
  position: relative;
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.carousel-video:hover {
  transform: scale(1.02);
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 20px;
  color: white;
}

.video-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
}

.video-info .video-meta {
  margin: 0 0 8px 0;
  opacity: 0.9;
}

/* 最新视频列表样式 */
.video-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;
}

.video-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.video-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
  transform: translateY(-2px);
}

.video-thumbnail {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 68px;
  border-radius: 4px;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
}

.video-content {
  flex: 1;
  min-width: 0;
}

.video-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-uploader {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #666;
}

.video-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.views {
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .header-content {
    height: 56px;
  }
  
  .search-bar {
    flex: 0 0 200px;
  }
  
  .content {
    padding: 0 16px 16px;
  }
  
  .main-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .right-section {
    position: static;
  }
  
  .carousel-container {
    height: 200px;
  }
  
  .carousel-item {
    height: 200px;
  }
  
  .video-thumbnail {
    width: 100px;
    height: 56px;
  }
}

* {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>