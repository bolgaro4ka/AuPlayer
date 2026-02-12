<script setup lang="ts">
import CommonHeader from '@/components/CommonHeader.vue';
import Param from '@/components/particles/Settings/Param.vue';
import { useSettingsStore } from '@/stores/settingsStore';

const settingsStore = useSettingsStore();

</script>

<template>
    <CommonHeader><h1>Настройки</h1></CommonHeader>
    <Param title="Amoled Mode" description="Делает фон развёрнутого плеера чёрным" s-type="checkbox" @change-checkbox="(val) => settingsStore.amoledMode = val" :current-value="settingsStore.amoledMode"/>
    <Param title="Prefer song image" description="Предпочитать обложки песен вместо стандартного визуализатора" s-type="checkbox" @change-checkbox="(val) => settingsStore.preferImage = val" :current-value="settingsStore.preferImage"/>
    <button @click="settingsStore.apply()">Применить</button>
</template>