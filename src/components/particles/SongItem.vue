<script setup lang="ts">
import type { MusicFile } from '@/composables/useMusicPlayer';
import { useMusicPlayer } from '@/stores/mainStore';

const musicPlayer = useMusicPlayer();
const props = defineProps<{
    file: MusicFile,
    search: string
}>();
</script>


<template>
    <div>
        <div :key="file.name" class="player__item"
            v-show="file.title.toLowerCase().includes(search.toLowerCase()) || file.name.toLowerCase().includes(search.toLowerCase()) || file.author.toLowerCase().includes(search.toLowerCase())"
            @click="musicPlayer.play(file)">
            <div class="player__img">
                <!-- SVG показывается, пока картинка не загрузилась -->
                <svg v-show="!file.isImageLoaded" xmlns="http://www.w3.org/2000/svg" height="24px"
                    viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                    <path
                        d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z" />
                </svg>

                <!-- Картинка: по событию load ставим imageLoaded = true -->
                <img v-if="file.imageUrl" v-show="file.isImageLoaded" :src="file.imageUrl"
                    @load="file.isImageLoaded = true" style="display: block;" alt="song" />
            </div>

            <div class="player__info">
                <h2>{{ file.title.length > 32 ? file.title.slice(0, 32) + '...' : file.title  }}</h2>
                <p>{{ file.author }}</p>
            </div>


        </div>
        <div class="player__line"></div>
    </div>
</template>

<style lang="scss" scoped>
.player__item {
    display: flex;
    gap: 16px;
    padding: 12px 16px;

    .player__info {
        h2 {
            font-size: 18px;
            margin: 0;
        }
        p {
            font-size: 14px;
            margin: 0;
        }
    }

    .player__img {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 8px;

        svg {
            width: 60%;
            height: 60%;
        }

        img {
            width: 100%;
            height: 100%;
            border-radius: 8px;
            object-fit: cover;
        }
    }


}

.player__line {
    width: calc(100% - 32px);
    height: 1px;
    margin: 5px 16px;
    border: 1px solid #444;
}
</style>