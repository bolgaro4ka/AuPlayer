<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useMusicPlayer } from '@/stores/mainStore'
import type { MusicFile } from "@/composables/useMusicPlayer";
import Modal from '@/components/Modal.vue'
import { ref, computed, watchEffect, onMounted } from 'vue'
import { storeToRefs } from 'pinia';

const route = useRoute()
const {
    playlists,
    currentPlaylist,
    files
} = storeToRefs(useMusicPlayer())

const {
    savePlaylists,
    getTracksFromPlaylist,
    play,
    loadPlaylists
} = useMusicPlayer()

// Инициализация данных
onMounted(async () => {
    await loadPlaylists()
})

// Получаем треки текущего плейлиста
const tracks = computed(() => {
    const playlistId = route.params.id as string
    return getTracksFromPlaylist(playlistId).filter(Boolean) as MusicFile[]
})

// Состояния для редактирования плейлиста
const showEditModal = ref(false)
const editSearch = ref('')
const selectedTracks = ref<string[]>([])
const dragItem = ref<number | null>(null)
const dragOverItem = ref<number | null>(null)

// Автоматическое обновление текущего плейлиста
watchEffect(() => {
    const playlistId = route.params.id as string
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (playlist) {
        currentPlaylist.value = playlist
    } else {
        currentPlaylist.value = null
    }
})

// Drag and Drop обработчики
const handleDragStart = (index: number) => {
    dragItem.value = index
}

const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault()
    dragOverItem.value = index
}

const handleDrop = () => {
    if (!currentPlaylist.value) return
    if (dragItem.value === null || dragOverItem.value === null) return

    const newItems = [...currentPlaylist.value.trackPaths]
    const draggedItem = newItems[dragItem.value]

    newItems.splice(dragItem.value, 1)
    newItems.splice(dragOverItem.value, 0, draggedItem)

    currentPlaylist.value.trackPaths = newItems
    savePlaylists()

    dragItem.value = null
    dragOverItem.value = null
}

// Открытие редактора плейлиста
const openEditor = () => {
    if (currentPlaylist.value) {
        selectedTracks.value = [...currentPlaylist.value.trackPaths]
    }
    showEditModal.value = true
}

// Сохранение изменений
const saveChanges = () => {
    if (currentPlaylist.value) {
        currentPlaylist.value.trackPaths = selectedTracks.value
        savePlaylists()
        showEditModal.value = false
    }
}

// Фильтрация треков для редактора
const filteredEditTracks = computed(() =>
    files.value.filter(f =>
        f.title?.toLowerCase().includes(editSearch.value.toLowerCase()) ||
        f.author?.toLowerCase().includes(editSearch.value.toLowerCase())
    )
)

// Удаление трека
const removeFromPlaylist = (trackPath: string) => {
    if (currentPlaylist.value) {
        currentPlaylist.value.trackPaths = currentPlaylist.value.trackPaths
            .filter(p => p !== trackPath)
        savePlaylists()
    }
}
</script>

<template>
    <div class="playlist-view">
        <div v-if="tracks.length">
            <div class="header">
                <h1>{{ currentPlaylist?.name || 'Плейлист' }}</h1>
                <button @click="openEditor" class="edit-button">✎ Изменить</button>
            </div>

            <div v-for="(track, index) in tracks" :key="track.path" class="track-item" draggable="true"
                @dragstart="handleDragStart(index)" @dragover="handleDragOver($event, index)" @drop="handleDrop" :class="{
                    'dragging': dragItem === index,
                    'drag-over': dragOverItem === index
                }">
                <div class="drag-handle">↕️</div>
                <div class="track-info" @click="play(track)">
                    <h3>{{ track.title || track.name }}</h3>
                    <p>{{ track.author || 'Неизвестный исполнитель' }}</p>
                </div>
                <button @click.stop="removeFromPlaylist(track.path)" class="delete-button">
                    🗑️
                </button>
            </div>
        </div>

        <div v-else class="empty">
            <h1>Плейлист пуст</h1>
            <button @click="openEditor">Добавить треки</button>
        </div>

        <Modal v-if="showEditModal" @close="showEditModal = false">
            <div class="edit-modal">
                <h2>Редактирование плейлиста</h2>
                <input v-model="editSearch" placeholder="Поиск треков..." class="search-input" />

                <div class="tracks-list">
                    <div v-for="track in filteredEditTracks" :key="track.path" class="track-item">
                        <label class="track-select">
                            <input type="checkbox" v-model="selectedTracks" :value="track.path" />
                            <span class="track-info">
                                {{ track.title }} - {{ track.author }}
                            </span>
                        </label>
                    </div>
                </div>

                <button @click="saveChanges" class="save-button" :disabled="!selectedTracks.length">
                    Сохранить изменения
                </button>
            </div>
        </Modal>
    </div>
</template>

<style scoped lang="scss">
.playlist-view {
    padding: 15px;
    min-height: 100vh;

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 0 10px;

        h1 {
            margin: 0;
            font-size: 24px;
            color: #fff;
        }

        .edit-button {
            background: #4CAF50;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            transition: background 0.2s;

            &:hover {
                background: #45a049;
            }
        }
    }
}

.track-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin: 8px 0;
    background: #333;
    border-radius: 8px;
    transition: transform 0.2s;
    cursor: grab;

    &.dragging {
        opacity: 0.5;
        background: #444;
    }

    &.drag-over {
        border: 2px dashed #4CAF50;
    }

    .drag-handle {
        margin-right: 15px;
        opacity: 0.6;
        transition: opacity 0.2s;

        &:hover {
            opacity: 1;
        }
    }

    .track-info {
        flex-grow: 1;
        cursor: pointer;

        h3 {
            margin: 0;
            font-size: 16px;
            color: white;
        }

        p {
            margin: 0;
            font-size: 14px;
            color: #aaa;
        }
    }

    .delete-button {
        background: none;
        border: none;
        color: #ff4444;
        cursor: pointer;
        padding: 5px;
        margin-left: 10px;
        opacity: 0.7;
        transition: opacity 0.2s;

        &:hover {
            opacity: 1;
        }
    }
}

.edit-modal {
    padding: 20px;
    background: #2a2a2a;
    border-radius: 12px;
    width: 90vw;
    max-width: 600px;
    color: white;

    h2 {
        margin-top: 0;
        text-align: center;
        color: #fff;
    }

    .search-input {
        width: 100%;
        padding: 12px;
        margin: 15px 0;
        border: 1px solid #444;
        border-radius: 8px;
        background: #333;
        color: white;
        font-size: 16px;
    }

    .tracks-list {
        max-height: 60vh;
        overflow-y: auto;

        .track-item {
            padding: 10px;
            margin: 8px 0;
            background: #3a3a3a;
            border-radius: 6px;
            cursor: pointer;

            .track-select {
                display: flex;
                align-items: center;
                gap: 12px;

                input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                }
            }
        }
    }

    .save-button {
        width: 100%;
        padding: 15px;
        margin-top: 20px;
        background: #4CAF50;
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.2s;

        &:disabled {
            background: #666;
            cursor: not-allowed;
        }

        &:not(:disabled):hover {
            background: #45a049;
        }
    }
}

.empty {
    text-align: center;
    padding: 40px 0;
    color: #fff;

    h1 {
        margin-bottom: 20px;
    }

    button {
        padding: 12px 25px;
        background: #4CAF50;
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
            background: #45a049;
        }
    }
}
</style>