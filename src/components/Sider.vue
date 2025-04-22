<script lang="ts" setup>
import SiderButton from './particles/Sider/SiderButton.vue';

</script>

<template>
    <div class="sider__wrapper">
        <div class="sider">
            <SiderButton url="/">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M640-160q-50 0-85-35t-35-85q0-50 35-85t85-35q11 0 21 1.5t19 6.5v-328h200v80H760v360q0 50-35 85t-85 35ZM120-320v-80h320v80H120Zm0-160v-80h480v80H120Zm0-160v-80h480v80H120Z"/></svg>
                <p>Библиотека</p>
            </SiderButton>
            <SiderButton url="/playlists/">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M500-360q42 0 71-29t29-71v-220h120v-80H560v220q-13-10-28-15t-32-5q-42 0-71 29t-29 71q0 42 29 71t71 29ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z"/></svg>
                <p>Плейлисты</p>
            </SiderButton>
            <SiderButton url="/repositories/">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H447l-80-80H160v480Zm0 0v-480 480Z"/></svg>
                <p>Репозитории</p>
            </SiderButton>
        </div>

    </div>
</template>

<style lang="scss" scoped>
.sider__wrapper {

    height: 60px;
    width: 100%;

    .sider {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 10px;
        width: 100%;
        height: 100%;
        padding-right: 10px;
    }
}
</style>