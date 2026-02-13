<template>
    <div class="directories-view">
        <h1 :style="{ color: musicPlayer.biteColor }">Репозитории</h1>
        <p>Здесь пути по которым ищется музыка</p>
        <ul>
            <li v-for="dir in directories" :key="dir">📁 {{ dir }}</li>
        </ul>
        <button @click="showExplorer = true">Добавить директорию</button>

        <Modal v-if="showExplorer" @close="showExplorer = false" title="📁 Выберите директорию">
            <Explorer ref="explorer" @select="onDirectorySelected" @close="showExplorer = false" />
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Preferences } from '@capacitor/preferences'
import Modal from '@/components/Modal.vue'
import Explorer from '@/components/Explorer.vue'
import { useMusicPlayer } from '@/stores/mainStore'

const musicPlayer = useMusicPlayer();
const directories = ref<string[]>([])
const showExplorer = ref(false)

onMounted(async () => {
    const saved = await Preferences.get({ key: 'directories' })
    if (saved.value) {
        directories.value = JSON.parse(saved.value)
    }
})

const explorer = ref();
function openExplorer() {
    showExplorer.value = true;
    explorer.value.pickRootDirectory(); // <-- запускает выбор
}

async function onDirectorySelected(uri: string) {
    console.log('Выбрана директория с URI:', uri);
    if (!directories.value.includes(uri)) {
        directories.value.push(uri);
        await Preferences.set({
            key: 'directories',
            value: JSON.stringify(directories.value),
        });
    }
    showExplorer.value = false;
}


</script>

<style scoped lang="scss">
.directories-view {
    color: #fff;
    height: 100%;

    p {
        color: #aaa;
        margin-bottom: 20px;
        font-size: 12px;
    }

    h1 {
        margin-top: 20px;
        margin-bottom: 10px;
    }

    h1,
    p {
        margin-left: 10px;
    }

    ul {
        list-style: none;

        li {
            width: 100vw;
            border-top: 1px solid #444;
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding-left: 10px;
            padding-right: 10px;
        }
    }

    button {
        padding-left: 10px;
        padding-right: 10px;
        width: 100vw;
        height: 50px;
        text-align: center;
        background-color: #444;
        border: none;
        color: #fff;
        cursor: pointer;
    }

    button:hover {
        background-color: #555;
    }
}
</style>
