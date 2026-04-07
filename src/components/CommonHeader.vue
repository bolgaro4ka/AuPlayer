<template>
    <div class="common__header">
        <div @click="$router.go(-1)" class="common__back">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M400-240 160-480l240-240 56 58-142 142h486v80H314l142 142-56 58Z"/></svg>
            <p>Назад</p>
        </div>

        <div>
            <slot></slot>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.common__header {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px 10px;
}

.common__back {
    padding: 10px 20px;
    border-radius: 15px;
    cursor: pointer;
    background-color: var(--primary-color);
    border: none;
    display: flex;
    align-items: center;
    gap: 10px;
    width: fit-content;

    p {
        color: var(--on-primary-color);
    }
    
    svg {
        fill: var(--on-primary-color);
    }
}
</style>