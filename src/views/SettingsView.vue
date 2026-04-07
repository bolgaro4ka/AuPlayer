<script setup lang="ts">
import CommonHeader from '@/components/CommonHeader.vue';
import Param from '@/components/particles/Settings/Param.vue';
import { useSettingsStore } from '@/stores/settingsStore';

const settingsStore = useSettingsStore();

</script>

<template>
    <CommonHeader>
        <h1>Настройки</h1>
    </CommonHeader>
    <Param title="Amoled Mode" description="Делает фон развёрнутого плеера чёрным" s-type="checkbox"
        @change-checkbox="(val) => settingsStore.amoledMode = val" :current-value="settingsStore.amoledMode" />
    <Param title="Prefer song image" description="Предпочитать обложки песен вместо стандартного визуализатора"
        s-type="checkbox" @change-checkbox="(val) => settingsStore.preferImage = val"
        :current-value="settingsStore.preferImage" />
    
    <button @click="settingsStore.apply()" class="save-button">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM565-275q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>
    </button>
</template>

<style scoped lang="scss">

h1 {
    margin-top: 10px;
    margin-bottom: 10px;
}

.save-button {
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 12px;
    border: none;
    background-color: var(--primary-color);
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
        fill: var(--on-primary-color);
    }
}
</style>