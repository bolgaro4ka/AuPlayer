<script setup lang="ts">
import { onMounted, watch } from 'vue';
import Sider from './components/Sider.vue';
import SongPage from './components/SongPage.vue';
import SplashScreen from './components/SplashScreen.vue';
import { StatusBar } from '@capacitor/status-bar';
import { setTheme } from './functions/colors';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(async () => {
    await StatusBar.setOverlaysWebView({ overlay: false })
    setTheme('dark');
})

watch(() => router.currentRoute.value.path, () => {
    console.log(router.currentRoute.value.path);
})

</script>

<template>

    <SplashScreen />

    <SongPage />

    <div class="main">
        <div class="view">
            <router-view v-slot="{ Component, route }">
                <!-- <transition :name="route.meta.transition as string | null || 'page-opacity'" mode="out-in"> -->
                    <keep-alive include="SongsView">

                        <component :is="Component" />

                    </keep-alive>
                <!-- </transition> -->
            </router-view>
        </div>
        <Sider />
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
        min-height: calc(100dvh - 60px - env(safe-area-inset-bottom));
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
    }
}

.page-opacity-enter-active,
.page-opacity-leave-active {
    opacity: 1;
    transition: 200ms ease all;
}

.page-opacity-enter-from,
.page-opacity-leave-to {
    opacity: 0.5;
    transition: 200ms ease all;
}
</style>
