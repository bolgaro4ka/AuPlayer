<template>
    <div>
        <Header @changeSearch="(val) => search = val" />
        <ul class="player__list"
            :style="musicPlayer.isSongPageFullScreen ? { overflow: 'hidden' } : { marginBottom: '100px' }">
            <li v-for="file in musicPlayer.files" :key="file.name" class="player__item"
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
                <div class="player__line"></div>
                <div class="player__info">
                    <h2>{{ file.title }}</h2>
                    <p>{{ file.author }}</p>
                </div>
            </li>
        </ul>

    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useMusicPlayer } from '@/stores/mainStore';
import Header from '@/components/Header.vue';

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

            h2,
            p {
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