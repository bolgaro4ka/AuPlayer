<script setup lang="ts">
import Sider from './components/Sider.vue';
import SongPage from './components/SongPage.vue';
import SplashScreen from './components/SplashScreen.vue';

</script>

<template>

  <SplashScreen/>
  
  <SongPage/>

  <div class="main">
    <div class="view">
      <router-view v-slot="{ Component }">
        <keep-alive include="SongsView">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <Sider/>
  </div>
</template>

<style lang="scss" scoped>

.main {
  display: flex;
  flex-direction: column;
  max-height: 100dvh;
  overflow: hidden;

  .view {
    overflow: scroll;
    min-height: calc(100dvh - 60px);
  }
}
</style>
