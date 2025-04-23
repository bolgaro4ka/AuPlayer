<template>
    <div class="modal">
      <div class="modal-content">
        <h2>📁 Выберите директорию</h2>
  
        <div class="current-path">📂 {{ currentPath || '/' }}</div>
  
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
            class="dir"
            @click="handleClick(entry)"
          >
            ▶️ {{ entry.name }}
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
  import { ref, onMounted, computed } from 'vue';
  import { Directory, Filesystem } from '@capacitor/filesystem';
  
  type DirEntry = { name: string; path: string; isDirectory: boolean };
  
  const emit = defineEmits(['close', 'select']);
  
  const basePath = '';
  const currentPath = ref('');
  const directories = ref<DirEntry[]>([]);
  
  const canGoUp = computed(() => currentPath.value && currentPath.value !== basePath);
  
  onMounted(() => {
    currentPath.value = basePath;
    loadDirectory();
  });
  
  async function loadDirectory() {
    try {
      const result = await Filesystem.readdir({
        path: currentPath.value,
        directory: Directory.External,
      });
  
      directories.value = result.files
        .filter((f) => f.type === 'directory')
        .map((f) => ({
          name: f.name,
          path: currentPath.value ? `${currentPath.value}/${f.name}` : f.name,
          isDirectory: true,
        }));
    } catch (e) {
      console.error('Ошибка чтения директории:', e);
      directories.value = [];
    }
  }
  
  function handleClick(entry: DirEntry) {
    currentPath.value = entry.path;
    loadDirectory();
  }
  
  function goUp() {
    const parts = currentPath.value.split('/');
    parts.pop();
    currentPath.value = parts.join('/') || basePath;
    loadDirectory();
  }
  
  function selectCurrent() {
    emit('select', currentPath.value || '/');
  }
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }
  
  .modal-content {
    background: #1e1e1e;
    color: #fff;
    padding: 20px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
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
  