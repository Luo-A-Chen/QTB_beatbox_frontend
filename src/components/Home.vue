<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
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

// 监听用户信息变化，确保头像更新后能及时显示
const currentUserInfo = ref(userInfo.value);

watch(userInfo, (newUserInfo) => {
  currentUserInfo.value = newUserInfo;
  console.log('用户信息已更新:', newUserInfo);
}, { deep: true, immediate: true });

// 监听localStorage变化（跨页面同步）
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'UserInfo') {
    try {
      const newUserInfo = event.newValue ? JSON.parse(event.newValue) : null;
      if (newUserInfo) {
        userStore.setUserInfo(newUserInfo);
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
};

onMounted(() => {
  window.addEventListener('storage', handleStorageChange);
});

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
    console.log('接口完整响应:', response);
    
    // 注意：axios 响应拦截器已经返回了 response.data
    // 所以这里的 response 就是后端返回的 {code: 200, message: '操作成功', data: [...]}
    
    // 检查后端返回的code是否为200
    if (response && response.code === 200) {
      const videos = response.data || [];
      videoList.value = videos;
      console.log('成功获取推荐视频:', videos.length, '个');
      console.log('视频列表详情:', videos);
    } else {
      console.error('获取推荐视频失败:', response?.message || '未知错误');
      console.error('响应code:', response?.code);
    }
  } catch (error: any) {
    console.error('请求推荐视频接口失败:', error);
    console.error('错误详情:', error.response?.data || error.message || '未知错误');
  } finally {
    loading.value = false;
    console.log('loading状态:', loading.value);
    console.log('videoList长度:', videoList.value.length);
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
  console.log('=== processedVideoList 计算 ===');
  console.log('原始视频数据 videoList.value:', videoList.value);
  console.log('videoList.value 长度:', videoList.value.length);
  
  if (!videoList.value || videoList.value.length === 0) {
    console.log('videoList 为空，返回空数组');
    return [];
  }
  
  const processed = videoList.value
    .filter(video => {
      console.log('过滤视频:', video.id, 'status:', video.status);
      return video.status === 1;
    })
    .map(video => {
      const result = {
        ...video,
        // 添加前端需要的字段
        thumbnail: video.cover, // 后端cover对应前端thumbnail
        durationDisplay: formatDuration(video.duration), // 格式化时长显示
        views: '0', // 后端没有提供，暂时设为0
        likes: '0', // 后端没有提供，暂时设为0
        uploader: '未知上传者', // 后端没有提供
        category: '表演', // 后端没有提供，暂时设为默认值
        difficulty: '中级' // 后端没有提供，暂时设为默认值
      };
      console.log('处理后的视频:', result);
      return result;
    });
  
  console.log('最终处理后的视频数据:', processed);
  console.log('处理后数组长度:', processed.length);
  return processed;
});

const featuredVideos = computed(() => processedVideoList.value.slice(0, 3));
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
const filteredVideos = computed(() => {
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
  
  return filtered;
});

const playVideo = (video: any) => {
  // 在实际项目中，这里可以打开视频播放模态框
  console.log('播放视频:', video.title);
};

// const likeVideo = (video: any) => {
//   // 点赞功能
//   console.log('点赞视频:', video.title);
// };

const handleUploadVideo = () => {
  router.push('/video');
};

// 图片加载失败处理
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E暂无图片%3C/text%3E%3C/svg%3E';
};

onMounted(() => {
  console.log('首页加载完成');
  // 加载后端数据
  fetchRecommendVideos();
});
</script>

<template>
  <div class="modern-video-site">
    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="header-container">
        <!-- Logo区域 -->
        <div class="logo-section">
          <div class="logo">
            <PlayCircleOutlined class="logo-icon" />
            <span class="logo-text">BeatBox Hub</span>
          </div>
        </div>
        
        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-wrapper">
            <a-input-search
              v-model:value="searchText"
              placeholder="搜索 Beatbox 视频、创作者..."
              class="search-input"
              size="large"
            />
          </div>
        </div>
        
        <!-- 用户操作区域 -->
        <div class="user-section">
          <template v-if="isLoggedIn">
            <a-button type="primary" @click="handleUploadVideo" class="upload-btn">
              <UploadOutlined /> 上传
            </a-button>
            <a-dropdown placement="bottomRight">
              <div class="user-profile">
                <a-avatar :size="36" :src="currentUserInfo.avatar" class="user-avatar">
                  {{ currentUserInfo.name?.charAt(0) || 'U' }}
                </a-avatar>
              </div>
              <template #overlay>
                <a-menu class="user-menu">
                  <a-menu-item @click="handleEditProfile">
                    <UserOutlined /> 个人资料
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
              <a-button type="default" class="auth-btn">登录</a-button>
            </router-link>
            <router-link to="/register">
              <a-button type="primary" class="auth-btn">注册</a-button>
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <div class="main-container">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <!-- 分类导航 -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">分类</h3>
          <div class="category-list">
            <div 
              v-for="category in categories" 
              :key="category.value"
              :class="['category-item', { active: selectedCategory === category.value }]"
              @click="selectedCategory = category.value"
            >
              {{ category.label }}
            </div>
          </div>
        </div>

        <!-- 广告区域 -->
        <div class="sidebar-section ad-section">
          <div class="ad-banner">
            <div class="ad-content">
              <h4>🎵 音乐制作课程</h4>
              <p>专业 Beatbox 教学</p>
              <a-button type="primary" size="small">了解更多</a-button>
            </div>
          </div>
        </div>

        <!-- 待开发功能 -->
        <div class="sidebar-section coming-soon">
          <h3 class="sidebar-title">即将推出</h3>
          <div class="feature-list">
            <div class="feature-item">
              <span class="feature-icon">🎤</span>
              <span>直播功能</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🏆</span>
              <span>比赛系统</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">👥</span>
              <span>社区论坛</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📱</span>
              <span>移动应用</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="main-content">
        <!-- 热门推荐轮播 -->
        <section v-if="featuredVideos.length > 0" class="hero-section">
          <a-spin :spinning="loading">
            <div class="hero-carousel">
              <a-carousel autoplay arrows effect="fade">
                <div v-for="video in featuredVideos" :key="video.id" class="hero-slide">
                  <div class="hero-video" @click="playVideo(video)">
                    <img :src="video.thumbnail" :alt="video.title" class="hero-image" @error="handleImageError" />
                    <div class="hero-overlay">
                      <div class="hero-content">
                        <h1 class="hero-title">{{ video.title }}</h1>
                        <p class="hero-description">{{ video.description }}</p>
                        <div class="hero-actions">
                          <a-button type="primary" size="large" class="play-btn">
                            <PlayCircleOutlined /> 立即观看
                          </a-button>
                          <div class="hero-meta">
                            <span>{{ video.uploader }}</span>
                            <span>•</span>
                            <span>{{ video.views }} 观看</span>
                            <span>•</span>
                            <span>{{ video.durationDisplay }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a-carousel>
            </div>
          </a-spin>
        </section>

        <!-- 视频网格 -->
        <section class="videos-section">
          <div class="section-header">
            <h2 class="section-title">
              <ClockCircleOutlined class="section-icon" />
              推荐视频
            </h2>
            <span class="video-count">{{ filteredVideos.length }} 个视频</span>
          </div>
          
          <a-spin :spinning="loading">
            <div v-if="filteredVideos.length > 0" class="video-grid">
              <div 
                v-for="video in filteredVideos" 
                :key="video.id"
                class="video-card"
                @click="playVideo(video)"
              >
                <div class="video-thumbnail">
                  <img :src="video.thumbnail" :alt="video.title" @error="handleImageError" />
                  <div class="video-duration">{{ video.durationDisplay }}</div>
                  <div class="video-hover-overlay">
                    <PlayCircleOutlined class="play-icon" />
                  </div>
                </div>
                <div class="video-info">
                  <h3 class="video-title">{{ video.title }}</h3>
                  <div class="video-meta">
                    <span class="uploader">{{ video.uploader }}</span>
                    <div class="video-stats">
                      <span>{{ video.views }} 观看</span>
                      <a-tag size="small" color="blue">{{ video.category }}</a-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="!loading" class="empty-state">
              <a-empty description="暂无相关视频">
                <template #image>
                  <PlayCircleOutlined style="font-size: 64px; color: #d9d9d9;" />
                </template>
              </a-empty>
            </div>
          </a-spin>
        </section>

        <!-- 广告横幅 -->
        <section class="ad-banner-section">
          <div class="horizontal-ad">
            <div class="ad-content-horizontal">
              <div class="ad-text">
                <h3>🎵 加入 BeatBox 创作者计划</h3>
                <p>分享你的才华，获得收益和粉丝支持</p>
              </div>
              <a-button type="primary" size="large">立即加入</a-button>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式 */
.modern-video-site {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航栏 */
.top-header {
  background: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  flex: 0 0 200px;
}

.logo {
  display: flex;
  align-items: center;
  color: #1890ff;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
}

.logo-icon {
  font-size: 32px;
  margin-right: 12px;
}

.logo-text {
  background: linear-gradient(135deg, #1890ff, #722ed1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-section {
  flex: 1;
  max-width: 600px;
  margin: 0 40px;
}

.search-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  border-radius: 24px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
}

.search-input:hover,
.search-input:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.user-section {
  flex: 0 0 200px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.upload-btn {
  border-radius: 20px;
  font-weight: 500;
}

.user-profile {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-profile:hover {
  transform: scale(1.05);
}

.user-avatar {
  border: 2px solid #1890ff;
}

.auth-btn {
  border-radius: 20px;
  font-weight: 500;
  min-width: 80px;
}

/* 主体布局 */
.main-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 24px;
  padding: 24px;
}

/* 侧边栏 */
.sidebar {
  flex: 0 0 280px;
  height: fit-content;
  position: sticky;
  top: 88px;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #262626;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #595959;
  font-weight: 500;
}

.category-item:hover {
  background: #f0f0f0;
  color: #1890ff;
}

.category-item.active {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: 600;
}

/* 广告区域 */
.ad-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.ad-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.ad-content p {
  margin: 0 0 16px 0;
  opacity: 0.9;
  font-size: 14px;
}

/* 即将推出功能 */
.coming-soon {
  border: 2px dashed #d9d9d9;
  background: #fafafa;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: #8c8c8c;
  font-size: 14px;
}

.feature-icon {
  font-size: 18px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  min-width: 0;
}

/* 英雄区域 */
.hero-section {
  margin-bottom: 40px;
}

.hero-carousel {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.hero-slide {
  height: 500px;
}

.hero-video {
  position: relative;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.hero-video:hover .hero-image {
  transform: scale(1.05);
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%);
  padding: 60px;
  color: white;
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

.hero-description {
  font-size: 18px;
  margin: 0 0 24px 0;
  opacity: 0.95;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.play-btn {
  align-self: flex-start;
  border-radius: 24px;
  height: 48px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  opacity: 0.9;
}

/* 视频网格区域 */
.videos-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 0 4px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #262626;
}

.section-icon {
  font-size: 28px;
  color: #1890ff;
}

.video-count {
  font-size: 14px;
  color: #8c8c8c;
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 12px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.video-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.video-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.video-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  background: #f0f0f0;
}

.video-thumbnail img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.video-card:hover .video-thumbnail img {
  transform: scale(1.1);
}

.video-duration {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(4px);
}

.video-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-card:hover .video-hover-overlay {
  opacity: 1;
}

.play-icon {
  font-size: 56px;
  color: white;
  opacity: 0.9;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.video-info {
  padding: 20px;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #262626;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.video-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploader {
  font-size: 14px;
  color: #8c8c8c;
  font-weight: 500;
}

.video-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #bfbfbf;
}

/* 横幅广告 */
.ad-banner-section {
  margin: 40px 0;
}

.horizontal-ad {
  background: linear-gradient(135deg, #ff6b6b, #feca57);
  border-radius: 16px;
  padding: 32px;
  color: white;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.2);
}

.ad-content-horizontal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
}

.ad-text h3 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
}

.ad-text p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-container {
    flex-direction: column;
  }
  
  .sidebar {
    flex: none;
    position: static;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    flex-wrap: wrap;
    height: auto;
    min-height: 64px;
  }
  
  .logo-section {
    flex: 0 0 auto;
  }
  
  .search-section {
    order: 3;
    flex: 1 1 100%;
    margin: 16px 0;
    max-width: none;
  }
  
  .user-section {
    flex: 0 0 auto;
  }
  
  .main-container {
    padding: 16px;
  }
  
  .sidebar {
    grid-template-columns: 1fr;
  }
  
  .hero-slide {
    height: 300px;
  }
  
  .hero-overlay {
    padding: 32px 24px;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  .ad-content-horizontal {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-slide {
    height: 250px;
  }
  
  .section-title {
    font-size: 24px;
  }
}
</style>