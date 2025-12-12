<template>
  <div class="modern-video-upload">
    <!-- 顶部导航 -->
    <header class="upload-header">
      <div class="header-container">
        <div class="header-left">
          <a-button type="text" @click="goBack" class="back-btn">
            <ArrowLeftOutlined />
          </a-button>
          <div class="header-title">
            <h1>上传视频</h1>
            <p>分享您的 Beatbox 精彩表演</p>
          </div>
        </div>
        <div class="header-actions">
          <a-button size="large" @click="goBack" class="cancel-btn">
            取消
          </a-button>
          <a-button 
            type="primary" 
            size="large"
            @click="handleSubmit" 
            :loading="loading"
            class="publish-btn"
          >
            {{ loading ? '发布中...' : '发布视频' }}
          </a-button>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <div class="upload-container">
      <div class="upload-content">
        <!-- 左侧上传区域 -->
        <div class="upload-section">
          <!-- 文件上传卡片 -->
          <div class="upload-card">
            <h2 class="card-title">选择视频文件</h2>
            <div class="upload-area">
              <a-upload
                v-model:file-list="fileList"
                :before-upload="beforeUpload"
                :custom-request="customUpload"
                :show-upload-list="false"
                accept="video/*"
                class="video-upload"
                :disabled="uploading"
              >
                <div class="upload-zone" :class="{ 'has-file': fileList.length > 0, 'uploading': uploading }">
                  <template v-if="fileList.length === 0">
                    <div class="upload-empty">
                      <div class="upload-icon">
                        <UploadOutlined />
                      </div>
                      <h3>点击或拖拽上传视频</h3>
                      <p class="upload-hint">支持 MP4、AVI、MOV 等格式</p>
                      <p class="upload-limit">文件大小不超过 500MB</p>
                    </div>
                  </template>
                  <template v-else>
                    <div class="file-preview">
                      <div class="file-icon">
                        <PlayCircleOutlined />
                      </div>
                      <div class="file-info">
                        <h4 class="file-name">{{ fileList[0]?.name || '未知文件' }}</h4>
                        <p class="file-size">{{ formatFileSize(fileList[0]?.size || 0) }}</p>
                        <div class="file-status" :class="{ 'uploading': uploading }">
                          {{ uploading ? '上传中...' : '准备就绪' }}
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </a-upload>
              
              <!-- 上传进度 -->
              <div v-if="uploading" class="upload-progress">
                <div class="progress-info">
                  <span class="progress-label">上传进度</span>
                  <span class="progress-percent">{{ uploadProgress }}%</span>
                </div>
                <a-progress 
                  :percent="uploadProgress" 
                  :show-info="false" 
                  stroke-color="#1890ff"
                  :stroke-width="6"
                />
              </div>
            </div>
          </div>

          <!-- 视频信息表单 -->
          <div class="form-card">
            <h2 class="card-title">视频信息</h2>
            <a-form :model="formState" :rules="rules" ref="formRef" layout="vertical" class="video-form">
              <!-- 视频标题 -->
              <a-form-item label="视频标题" name="title" class="form-item">
                <a-input
                  v-model:value="formState.title"
                  placeholder="为您的视频起一个吸引人的标题..."
                  :maxlength="50"
                  show-count
                  size="large"
                  class="modern-input"
                />
                <div class="field-tip">好的标题能帮助更多人发现您的作品</div>
              </a-form-item>

              <!-- 视频描述 -->
              <a-form-item label="视频描述" name="description" class="form-item">
                <a-textarea
                  v-model:value="formState.description"
                  placeholder="描述您的视频内容、创作背景或想要分享的故事..."
                  :rows="4"
                  :maxlength="200"
                  show-count
                  class="modern-textarea"
                />
                <div class="field-tip">详细的描述有助于观众更好地理解您的作品</div>
              </a-form-item>
            </a-form>
          </div>
        </div>

        <!-- 右侧预览区域 -->
        <div class="preview-section">
          <div class="preview-card">
            <h2 class="card-title">视频预览</h2>
            <div class="preview-container">
              <div v-if="videoPreviewUrl" class="video-preview-wrapper">
                <video 
                  :src="videoPreviewUrl" 
                  controls 
                  class="video-preview"
                  preload="metadata"
                >
                  您的浏览器不支持视频播放
                </video>
                <div class="preview-info">
                  <div class="preview-meta">
                    <span class="meta-item">
                      <ClockCircleOutlined />
                      时长: {{ videoDuration || '计算中...' }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="preview-placeholder">
                <div class="placeholder-content">
                  <PlayCircleOutlined class="placeholder-icon" />
                  <h3>视频预览</h3>
                  <p>选择视频文件后，将在此处显示预览</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 上传提示 -->
          <div class="tips-card">
            <h3 class="tips-title">上传建议</h3>
            <div class="tips-list">
              <div class="tip-item">
                <div class="tip-icon">📹</div>
                <div class="tip-text">
                  <strong>视频质量</strong>
                  <p>建议使用 1080p 或更高分辨率</p>
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">🎵</div>
                <div class="tip-text">
                  <strong>音频清晰</strong>
                  <p>确保音频质量清晰，无杂音</p>
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">⏱️</div>
                <div class="tip-text">
                  <strong>时长适中</strong>
                  <p>建议视频时长在 30秒-10分钟</p>
                </div>
              </div>
              <div class="tip-item">
                <div class="tip-icon">🏷️</div>
                <div class="tip-text">
                  <strong>标题描述</strong>
                  <p>使用准确的标题和详细描述</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../auth';
import { message, type FormInstance, type UploadFile } from 'ant-design-vue';
import { 
  UploadOutlined, 
  PlayCircleOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const formRef = ref<FormInstance>();

// 表单状态
const formState = reactive({
  title: '',
  description: '',
  videoFile: null as File | null
});

// 文件上传相关
const fileList = ref<UploadFile[]>([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const loading = ref(false);

// 视频预览URL和时长
const videoPreviewUrl = ref('');
const videoDuration = ref('');

// 表单验证规则
const rules = {
  videoFile: [
    { required: true, message: '请选择视频文件', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在2-50个字符之间', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
};

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 上传前验证
const beforeUpload = (file: File): boolean => {
  // 检查文件类型
  const isVideo = file.type.startsWith('video/');
  if (!isVideo) {
    message.error('只能上传视频文件！');
    return false;
  }

  // 检查文件大小（500MB限制）
  const isLt500M = file.size / 1024 / 1024 < 500;
  if (!isLt500M) {
    message.error('视频文件不能超过500MB！');
    return false;
  }

  // 保存原生 File 对象到表单字段，用于表单验证和上传
  formState.videoFile = file;

  // 创建预览URL
  if (videoPreviewUrl.value) {
    URL.revokeObjectURL(videoPreviewUrl.value);
  }
  videoPreviewUrl.value = URL.createObjectURL(file);
  
  // 获取视频时长
  const video = document.createElement('video');
  video.src = videoPreviewUrl.value;
  video.onloadedmetadata = () => {
    const duration = video.duration;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    videoDuration.value = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 阻止自动上传，等待用户点击"发布视频"按钮
  return false;
};

// 自定义上传逻辑
const customUpload = async (options: any) => {
  const { onProgress, onSuccess, onError } = options;
  
  uploading.value = true;
  uploadProgress.value = 0;

  try {
    // 检查是否有文件
    if (!formState.videoFile) {
      throw new Error('没有选择视频文件');
    }

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10;
        onProgress({ percent: uploadProgress.value });
      }
    }, 200);

    // 创建FormData - 与后端接口匹配
    const formData = new FormData();
    
    // 创建视频信息对象
    const videoInfo = {
      title: formState.title,
      description: formState.description
    };
    
    // 后端接口要求：@RequestPart("info") VideoRequest req
    formData.append('info', new Blob([JSON.stringify(videoInfo)], { 
      type: 'application/json' 
    }));
    
    // 后端接口要求：@RequestPart("file") MultipartFile file
    // 使用 formState.videoFile 中的原生 File 对象
    formData.append('file', formState.videoFile as File);

    // 调用上传接口
    const response = await api.post('/video/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          uploadProgress.value = percent;
          onProgress({ percent });
        }
      }
    });

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    // 上传成功
    onSuccess(response, formState.videoFile);
    message.success('视频上传成功！');
    
    // 延迟跳转，让用户看到成功消息
    setTimeout(() => {
      router.back();
    }, 1500);

  } catch (error: any) {
    console.error('视频上传失败:', error);
    onError(error);
    message.error('视频上传失败，请重试');
  } finally {
    uploading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value?.validate();

    // 检查是否选择了文件
    if (fileList.value.length === 0) {
      message.error('请选择要上传的视频文件');
      return;
    }

    loading.value = true;
    uploading.value = true;

    // 触发上传
    const uploadOptions = {
      onProgress: (progressEvent: any) => {
        uploadProgress.value = progressEvent.percent;
      },
      onSuccess: (response: any, file: any) => {
        message.success('视频上传成功！');
        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          router.back();
        }, 1500);
      },
      onError: (error: any) => {
        console.error('视频上传失败:', error);
        message.error('视频上传失败，请重试');
      }
    };
    
    await customUpload(uploadOptions);

  } catch (error) {
    console.error('表单验证失败:', error);
    message.error('请检查表单信息是否正确');
  } finally {
    loading.value = false;
    uploading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style scoped>
/* 全局样式 */
.modern-video-upload {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 顶部导航 */
.upload-header {
  background: white;
  border-bottom: 1px solid #e8e8e8;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.header-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  border-radius: 8px;
  font-weight: 500;
  min-width: 80px;
}

.publish-btn {
  border-radius: 8px;
  font-weight: 500;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

/* 主要内容 */
.upload-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 24px;
}

.upload-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  align-items: start;
}

/* 左侧上传区域 */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-card,
.form-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-title {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #262626;
}

/* 上传区域 */
.upload-area {
  position: relative;
}

.upload-zone {
  border: 3px dashed #d9d9d9;
  border-radius: 16px;
  padding: 48px 32px;
  text-align: center;
  transition: all 0.3s ease;
  background: #fafafa;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover {
  border-color: #1890ff;
  background: #f0f8ff;
}

.upload-zone.has-file {
  border-color: #52c41a;
  background: #f6ffed;
}

.upload-zone.uploading {
  border-color: #1890ff;
  background: #f0f8ff;
  cursor: not-allowed;
}

.upload-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 64px;
  color: #1890ff;
  margin-bottom: 8px;
}

.upload-empty h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.upload-hint {
  margin: 0;
  font-size: 14px;
  color: #8c8c8c;
}

.upload-limit {
  margin: 0;
  font-size: 12px;
  color: #bfbfbf;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 20px;
}

.file-icon {
  font-size: 56px;
  color: #52c41a;
}

.file-info {
  text-align: left;
}

.file-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.file-size {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #8c8c8c;
}

.file-status {
  font-size: 14px;
  color: #52c41a;
  font-weight: 500;
}

.file-status.uploading {
  color: #1890ff;
}

/* 上传进度 */
.upload-progress {
  margin-top: 24px;
  padding: 20px;
  background: #f0f8ff;
  border-radius: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.progress-percent {
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

/* 表单样式 */
.video-form {
  max-width: none;
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

/* 右侧预览区域 */
.preview-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 120px;
}

.preview-card,
.tips-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.preview-container {
  border-radius: 12px;
  overflow: hidden;
  background: #000;
}

.video-preview-wrapper {
  position: relative;
}

.video-preview {
  width: 100%;
  height: auto;
  max-height: 300px;
  display: block;
}

.preview-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 16px;
  color: white;
}

.preview-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.preview-placeholder {
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.placeholder-content {
  text-align: center;
  color: #8c8c8c;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #d9d9d9;
}

.placeholder-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.placeholder-content p {
  margin: 0;
  font-size: 14px;
}

/* 提示卡片 */
.tips-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  display: flex;
  gap: 12px;
}

.tip-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
  flex-shrink: 0;
}

.tip-text strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
}

.tip-text p {
  margin: 0;
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
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
@media (max-width: 1200px) {
  .upload-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .preview-section {
    position: static;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 16px;
    height: 64px;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .header-title h1 {
    font-size: 20px;
  }
  
  .header-title p {
    display: none;
  }
  
  .header-actions {
    order: 3;
    width: 100%;
    justify-content: flex-end;
  }
  
  .upload-container {
    padding: 20px 16px;
  }
  
  .upload-card,
  .form-card,
  .preview-card,
  .tips-card {
    padding: 20px;
    border-radius: 12px;
  }
  
  .upload-zone {
    padding: 32px 20px;
    min-height: 160px;
  }
  
  .upload-icon {
    font-size: 48px;
  }
  
  .file-icon {
    font-size: 40px;
  }
  
  .file-preview {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .preview-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-container {
    height: auto;
    min-height: 64px;
    padding: 12px 16px;
  }
  
  .header-left {
    gap: 12px;
  }
  
  .upload-empty h3 {
    font-size: 16px;
  }
  
  .upload-hint,
  .upload-limit {
    font-size: 12px;
  }
  
  .card-title {
    font-size: 18px;
  }
}
</style>