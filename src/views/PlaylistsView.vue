<script setup lang="ts">
import Modal from '@/components/Modal.vue'
import { useMusicPlayer } from '@/stores/mainStore'
import { ref } from 'vue'

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

</script>


<template>
  <div>
  <!-- Тут список плэйлистов с возможностью создания -->
  <div v-for="playlist in playlists" :key="playlist.id">
    <router-link :to="`/playlist/${playlist.id}`">{{ playlist.name }}</router-link>
  </div>
  <button @click="isShowPlaylistCreator = !isShowPlaylistCreator">Create</button>
   <Teleport to="body">
    <Suspense>
      <Modal v-if="isShowPlaylistCreator" @close="isShowPlaylistCreator = false">
        <div>
          <input v-model="newPlaylistName" placeholder="Название" />
          <input type="file" @change="onImageChange" accept="image/*" />
          <div v-for="track in files" :key="track.path">
            <label><input type="checkbox" v-model="selectedPaths" :value="track.path" /> {{ track.title }}</label>
          </div>
          <button @click="createPlaylist">Создать</button>
        </div>
      </Modal>
      
    </Suspense>
   </Teleport>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
