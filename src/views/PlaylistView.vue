<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useMusicPlayer } from '@/stores/mainStore'

const { getTracksFromPlaylist, currentPlaylist, play } = useMusicPlayer()
const route = useRoute()
const tracks = getTracksFromPlaylist(route.params.id as string)

console.log(tracks, route.params.id)

if (currentPlaylist) {
  currentPlaylist.id = route.params.id as string
  currentPlaylist.trackPaths = tracks.map(t => t.path).filter((path): path is string => path !== undefined)
}
</script>

<template>
  <div v-if="tracks.length">
    <h1>Плейлист</h1>
    <div v-for="track in tracks" :key="track.path">
      <div @click="play(track)">
        {{ track.title }} — {{ track.author }}
      </div>
    </div>
  </div>
  <div v-else>
    <h1>Плейлист пуст</h1>
  </div>
</template>

