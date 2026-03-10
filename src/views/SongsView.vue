<template>
    <div>
        <Header @changeSearch="(val) => search = val" />
        <div class="player__list"
            :style="musicPlayer.isSongPageFullScreen ? { overflow: 'hidden' } : { marginBottom: '100px' }">
            <SongItem v-for="file in musicPlayer.files" :key="file.path" :file="file" :search="search" />
        </div>

    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useMusicPlayer } from '@/stores/mainStore';
import Header from '@/components/Header.vue';
import SongItem from '@/components/particles/SongItem.vue';
import { AdvancedHaptics } from 'capacitor-advanced-haptics';

const musicPlayer = useMusicPlayer();
const search = ref<string>('');

watch(() => musicPlayer.isSongPageFullScreen, (value) => {
    document.body.style.overflow = value ? 'hidden' : '';
});

onMounted(async () => {
    await musicPlayer.loadMusicFromDirectories();
    let inv : any;
    let i = 0;
    
    inv = setInterval(async () => {
        await AdvancedHaptics.predefined({type: 'tick'})
        i++
        if (i >= 10) {
            clearInterval(inv );
        }
    }, 200);
});
</script>

<style lang="scss" scoped>
.player {



    width: 100%;



    &__list {
        margin-top: calc(55px);
        list-style: none;
        width: 100%;
        padding: 0;
    }

    
}
</style>