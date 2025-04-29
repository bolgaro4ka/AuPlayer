<template>
    <div class="splash-screen" :class="{ hide: !visible }">
      <div class="splash-content">
        <div class="logo">
          <span v-for="(char, i) in text" :key="i" class="logo-char" :style="{ animationDelay: `${i * 0.2}s` }">
            {{ char }}
          </span>
        </div>
        <div class="equalizer">
          <div v-for="i in 7" :key="i" class="bar" :style="{ animationDelay: `${i * 0.15}s` }"></div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  
  const visible = ref(true);
  const text = 'AuPlayer'.split('');
  
  onMounted(() => {
    setTimeout(() => {
      visible.value = false;
    }, 1000);
  });
  </script>
  
  <style scoped>
  .splash-screen {
    position: fixed;
    inset: 0;
    background-color: black;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 1s ease, visibility 1s ease;
    opacity: 1;
    visibility: visible;
  }
  
  .splash-screen.hide {
    opacity: 0;
    visibility: hidden;
  }
  
  .splash-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .logo {
    display: flex;
    font-size: 3rem;
    font-weight: bold;
    color: white;
  }
  
  .logo-char {
    display: inline-block;
    animation: bounce 0.6s ease-in-out infinite, colorShift 2s infinite alternate;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes colorShift {
    0% { color: #ff4081; }
    50% { color: #00e5ff; }
    100% { color: #76ff03; }
  }
  
  /* Equalizer Bars */
  .equalizer {
    display: flex;
    gap: 6px;
    margin-top: 20px;
    height: 40px;
    align-items: end;
  }
  
  .bar {
    width: 6px;
    height: 10px;
    background: #333;
    border-radius: 3px;
    animation: barBounce 1s ease-in-out infinite;
  }
  
  @keyframes barBounce {
    0%, 100% {
      transform: scaleY(0.4);
    }
    50% {
      transform: scaleY(1.2);
    }
  }
  </style>
  