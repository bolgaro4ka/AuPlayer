<template>
  <div class="player" :style="musicPlayer.isSongPageFullScreen ? { overflow: 'hidden' } : {}">
    <div class="player__search">
      <h2 :style="{color: musicPlayer.biteColor}">AuPlayer</h2>
      <input type="text" v-model="search" placeholder="Найти">
      <div class="player__search-clear" @click="search=''" v-if="search">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
      </div>
    </div>
    <ul class="player__list" :style="musicPlayer.isSongPageFullScreen ? { overflow: 'hidden' } : { marginBottom: '100px'}">
      <li
        v-for="file in musicPlayer.files"
        :key="file.name"
        class="player__item"
        v-show="file.title.toLowerCase().includes(search.toLowerCase()) || file.name.toLowerCase().includes(search.toLowerCase()) || file.author.toLowerCase().includes(search.toLowerCase())"
        @click="musicPlayer.play(file)"
      >
      <div class="player__img">
        <!-- SVG показывается, пока картинка не загрузилась -->
        <svg
          v-show="!file.isImageLoaded"
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#e8eaed"
        ><path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z"/></svg>
      
        <!-- Картинка: по событию load ставим imageLoaded = true -->
        <!-- <img
          v-if="file.imageUrl"
          v-show="file.isImageLoaded"
          :src="file.imageUrl"
          @load="file.isImageLoaded = true"
          style="display: block;"
        /> -->
      </div>
        <div class="player__line"></div>
        <div class="player__info">
          <h2>{{ file.title }}</h2>
          <p>{{file.author}}</p>
        </div>
      </li>
    </ul>
    
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useMusicPlayer } from '@/stores/mainStore';

const musicPlayer = useMusicPlayer();
const search = ref<string>('');

watch(() => musicPlayer.isSongPageFullScreen, (value) => {
  document.body.style.overflow = value ? 'hidden' : '';
});

onMounted(async () => {
  await musicPlayer.loadMusicFromDirectories();
});
</script>

<style lang="scss" scoped>
.player {



  width: 100%;

  &__search {
    height: 50px;
    width: 100vw;
    display: flex;
    align-items: center;
    padding-left: 5px;
    padding-right: 5px;
    gap: 10px;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #333;

    h2 {
      font-size: 30px;

    }

    input {
      width: 100%;
      height: 100%;
      background: #333;
      border: none;
      color: white;
      font-size: 24px;
      font-weight: 900;
      padding: 0 1rem;
      outline: none;
    }
  }
  &__list {
    margin-top: 50px;
    list-style: none;
    width: 100%;
    padding: 0;
  }
  &__item {
    background: #333;
    border-top: 1px solid #414141;
    padding: 0.5rem;
 
    cursor: pointer;

    display: flex;
    align-items: center;

    &:hover {
      background: #000;
    }

    
    

    img {
      width: 30px;
    }

    svg {
      width: 30px;
    }


    .player__info {
      width: 100%;
      min-height: 40px;

      h2, p {
        overflow: hidden;
        width: 90%;
        word-break: break-word;
      }

      h2 {
        color: white;
        font-size: 16px;
        font-weight: 900;
      }

      p {
        color: #aaa;
        font-size: 12px;
      }
    }
  }

  .player__line {
    width: 2px;
    height: 40px;
    background-color: #414141;
    margin-left: 5px;
    margin-right: 5px;
  }
}
</style>