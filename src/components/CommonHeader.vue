<template>
    <div class="common__header">
        <div @click="$router.go(-1)">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/></svg>
        </div>
        <div>
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.common__header {
    display: flex;
    width: 100%;
    align-items: center;
    gap: 10px;
    padding: 10px 10px;
}
</style>