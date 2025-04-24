<template>
  <div class="modal">
    <div class="modal-content">

      <div class="current-path">📂 {{ currentPath }}</div>

      <div class="explorer">
        <div
          v-if="canGoUp"
          class="dir dir-up"
          @click="goUp"
        >
          🔙 .. (вверх)
        </div>

        <div
          v-for="entry in directories"
          :key="entry.name"
          :class="(entry.isDirectory || musicTypesRef.includes(entry.name.split('.').pop() as string)) && ['dir', !entry.isDirectory && 'file']"
          @click="entry.isDirectory && handleClick(entry)"
        >
          <template v-if="entry.isDirectory">📁 {{ entry.name }}</template>
          <template v-else-if="musicTypesRef.includes(entry.name.split('.').pop() as string)">{{' 🎵 ' + entry.name}}</template>
        </div>

      </div>

      <div class="actions">
        <button @click="$emit('close')">Отмена</button>
        <button class="confirm" @click="selectCurrent">Выбрать эту директорию</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Filesystem } from '@capacitor/filesystem';
import { musicTypes } from '@/types/musicTypes';

const emit = defineEmits(['close', 'select']);

const basePath = '/storage/emulated/0';
const currentPath = ref(basePath);
const directories = ref<{ name: string; path: string; isDirectory: boolean }[]>([]);
const historyStack = ref<string[]>([]);
const canGoUp = computed(() => historyStack.value.length > 0);

const musicTypesRef = ref(musicTypes);

onMounted(async () => {
  await ensurePermissions();
  await loadDirectory();
});

async function ensurePermissions() {
  console.log('Сделаем вид что все разрешения даны.')
}

async function loadDirectory() {
  try {
    const result = await Filesystem.readdir({
      path: currentPath.value,
      directory: undefined,
    });

    directories.value = result.files.map((f) => ({
      name: f.name,
      path: currentPath.value ? `${currentPath.value}/${f.name}` : f.name,
      isDirectory: f.type === 'directory',
    }));

  } catch (e) {
    console.error('Ошибка чтения директории:', e);
    directories.value = [];
  }
}

function handleClick(entry: { name: string; path: string; isDirectory: boolean }) {
  if (entry.isDirectory) {
    historyStack.value.push(currentPath.value);
    currentPath.value = entry.path;
    loadDirectory();
  }
}

function goUp() {
  const last = historyStack.value.pop();
  if (last) {
    currentPath.value = last;
    loadDirectory();
  }
}

function selectCurrent() {
  emit('select', currentPath.value);
}
</script>

<style scoped>
.modal {
  width: 100%;
  height: 100%;
}

.modal-content {
  background: #1e1e1e;
  color: #fff;
  padding: 20px;
  width: 100%;
  height: 100%;
}

h2 {
  font-size: 20px;
  margin-bottom: 12px;
}

.current-path {
  font-size: 14px;
  color: #aaa;
  margin-bottom: 16px;
}

.explorer {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #444;
  padding: 8px;
  border-radius: 6px;
  background-color: #2a2a2a;
}

.dir {
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.dir:hover {
  background-color: #3a3a3a;
}

.dir-up {
  font-style: italic;
  color: #bbb;
}

.actions {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

button {
  background: #444;
  color: #fff;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #555;
}

button.confirm {
  background: #4caf50;
}

button.confirm:hover {
  background: #45a049;
}
</style>
