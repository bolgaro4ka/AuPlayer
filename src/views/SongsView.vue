<template>
  <div class="player" :style="musicPlayer.isSongPageFullScreen ? { overflow: 'hidden' } : {}">
    <ul class="player__list">
      <li
        v-for="file in musicPlayer.files"
        :key="file.name"
        class="player__item"
        @click="musicPlayer.play(file)"
      >
        <h2>{{ file.name }}</h2>
      </li>
    </ul>
    
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import SongPage from '@/components/SongPage.vue';
import { useMusicPlayer } from '@/stores/mainStore';

const musicPlayer = useMusicPlayer();

watch(() => musicPlayer.isSongPageFullScreen, (value) => {
  document.body.style.overflow = value ? 'hidden' : '';
});

onMounted(() => {
  musicPlayer.loadFiles();
});
</script>

<style lang="scss" scoped>
.player {
  width: 100%;
  &__list {
    list-style: none;
    width: 100%;
    padding: 0;
  }
  &__item {
    background: #333;
    border-top: 1px solid #414141;
    padding: 0.5rem;
    cursor: pointer;
    &:hover {
      background: #000;
    }
    h2 {
      color: white;
      font-size: 12px;
      font-weight: 900;
    }
  }
}
</style>