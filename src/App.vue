<script setup lang="ts">
import Home from './components/Home.vue'
import {ref, watchEffect} from 'vue'

const theme = ref('默认');

//切换主题
const toggleTheme=()=>{
  theme.value = theme.value === '暗黑' ? '默认' : '暗黑';
}
// 监听 theme 变化，动态修改 body 的 theme 属性
watchEffect(() => {
  if (theme.value === '暗黑') {
    document.body.setAttribute('data-theme', '暗黑');
  } else {
    document.body.setAttribute('data-theme', '默认');
  }
});
</script>

<template>
  <div :data-theme="theme">
    <button @click="toggleTheme">切换主题</button>
    <p>当前主题：{{ theme }}</p>
  </div>
  <div>
    <Home />
  </div>
</template>
<style>
:root{
  --primary-color:#3498db;
  --background-color:#ffffff;
  --text-color:#333333;
}
[data-theme="dark"]{
  --primary-color:#2ecc71;
  --background-color:#2c3e50;
  --text-color:#ecf0f1;
}
body{
  background-color:var(--background-color);
  color:var(--text-color);
  font-family:Arial,sans-serif;
  margin:0;
  padding:20px;
}
button{
  background-color: var(--primary-color);
  color: var(--text-color);
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
button:hover {
  background-color: var(--primary-color);
}
</style>
