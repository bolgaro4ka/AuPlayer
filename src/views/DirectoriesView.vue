<template>
  <div class="directories-view">
    <h1>Добавленные директории</h1>
    <ul>
      <li v-for="dir in directories" :key="dir">📁 {{ dir }}</li>
    </ul>
    <button @click="showExplorer = true">Добавить директорию</button>

    <Modal v-if="showExplorer" @close="showExplorer = false">
      <Explorer @select="handleDirectorySelect" @close="showExplorer = false" />
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Preferences } from '@capacitor/preferences'
import Modal from '@/components/Modal.vue'
import Explorer from '@/components/Explorer.vue'

const directories = ref<string[]>([])
const showExplorer = ref(false)

onMounted(async () => {
  const saved = await Preferences.get({ key: 'directories' })
  if (saved.value) {
    directories.value = JSON.parse(saved.value)
  }
})

async function handleDirectorySelect(uri: string) {
  if (!directories.value.includes(uri)) {
    directories.value.push(uri)
    await Preferences.set({
      key: 'directories',
      value: JSON.stringify(directories.value),
    })
  }
  showExplorer.value = false
}
</script>

<style scoped>
.directories-view {
  padding: 1rem;
  color: #fff;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #444;
  border: none;
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background-color: #555;
}
</style>
