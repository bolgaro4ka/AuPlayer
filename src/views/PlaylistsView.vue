<script setup lang="ts">
import Modal from '@/components/Modal.vue'
import { useMusicPlayer } from '@/stores/mainStore'
import { computed, ref } from 'vue'

const { files, addPlaylist, playlists } = useMusicPlayer()
const newPlaylistName = ref('')
const selectedPaths = ref<string[]>([])
const playlistImage = ref<string | undefined>()
const isShowPlaylistCreator = ref(false);

const onImageChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      playlistImage.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

const createPlaylist = () => {
  addPlaylist(newPlaylistName.value, playlistImage.value, selectedPaths.value)
  isShowPlaylistCreator.value = false
  newPlaylistName.value = ''
  selectedPaths.value = []
  playlistImage.value = undefined
}

const searchQuery = ref('')

const filteredTracks = computed(() => 
  files.filter(file => 
    file.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    file.author.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

</script>


<template>
  <div>
  <!-- Тут список плэйлистов с возможностью создания -->
  <div class="playlists-container">
    <div v-for="playlist in playlists" :key="playlist.id" class="playlist-item">
      <router-link :to="`/playlist/${playlist.id}`" class="playlist-link">
        <img 
          v-if="playlist.image" 
          :src="playlist.image" 
          class="playlist-image"
          alt="Обложка плейлиста"
        />
        <div class="playlist-info">
          <h3>{{ playlist.name }}</h3>
          <span>{{ playlist.trackPaths.length }} треков</span>
        </div>
      </router-link>
    </div>
  </div>
  <button @click="isShowPlaylistCreator = !isShowPlaylistCreator">Create</button>
  <Teleport to="body">
    <Modal v-if="isShowPlaylistCreator" @close="isShowPlaylistCreator = false">
      <div class="playlist-creator">
        <div class="form-group">
          <input 
            v-model="newPlaylistName" 
            placeholder="Название плейлиста"
            class="playlist-name-input"
          />
        </div>
        
        <div class="form-group">
          <label class="image-upload">
            <input 
              type="file" 
              @change="onImageChange" 
              accept="image/*"
              hidden
            />
            <span class="upload-button">
              {{ playlistImage ? 'Изменить обложку' : 'Добавить обложку' }}
            </span>
            <img 
              v-if="playlistImage" 
              :src="playlistImage" 
              class="preview-image"
            />
          </label>
        </div>

        <div class="search-tracks">
          <input
            v-model="searchQuery"
            placeholder="Поиск треков..."
            class="search-input"
          />
          
          <div class="tracks-list">
            <div
              v-for="track in filteredTracks"
              :key="track.path"
              class="track-item"
            >
              <label class="track-select">
                <input
                  type="checkbox"
                  v-model="selectedPaths"
                  :value="track.path"
                />
                <span class="track-info">
                  {{ track.title }} - {{ track.author }}
                </span>
              </label>
            </div>
          </div>
        </div>

        <button 
          @click="createPlaylist"
          class="create-button"
          :disabled="!newPlaylistName || selectedPaths.length === 0"
        >
          Создать
        </button>
      </div>
    </Modal>
  </Teleport>
</div>
</template>

<style scoped lang="scss">

.playlist-image {
  height: 50px;
}

.playlist-creator {
padding: 20px;
background: #2a2a2a;
border-radius: 12px;
width: 90vw;
max-width: 500px;
color: white;

.form-group {
  margin-bottom: 15px;
}

.playlist-name-input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #444;
  background: #333;
  color: white;
  font-size: 16px;
}

.image-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  .preview-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
  }

  .upload-button {
    padding: 8px 15px;
    background: #3a3a3a;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #4a4a4a;
    }
  }
}

.search-input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #444;
  background: #333;
  color: white;
}

.tracks-list {
  max-height: 50vh;
  overflow-y: auto;

  .track-item {
    padding: 10px;
    border-radius: 8px;
    margin: 5px 0;
    background: #333;

    .track-select {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
      }
    }
  }
}

.create-button {
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background: #4CAF50;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
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


</style>