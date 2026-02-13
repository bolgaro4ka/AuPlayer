<script setup lang="ts">
interface Playlist {
    id: string
    name: string
    image?: string
    trackPaths: string[]
}

const props = defineProps<{
    playlists: Playlist[]
}>()
</script>

<template>
    <div class="playlists-container">
        <div v-for="playlist in playlists" :key="playlist.id" class="playlist-item">
            <router-link :to="`/playlist/${playlist.id}`" class="playlist-link">
                <img v-if="playlist.image" :src="playlist.image" class="playlist-image" alt="Обложка плейлиста" />
                <div class="playlist-info">
                    <h3>{{ playlist.name }}</h3>
                    <span>{{ playlist.trackPaths.length }} треков</span>
                </div>
            </router-link>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.playlist-item > .playlist-link {
    width: 100%;
    border-top: 1px solid #555;
    border-bottom: 1px solid #555;
    display: flex;
    align-items: center;
    gap: 15px;
    height: 60px;
    padding: 0px 10px;

    img {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 8px;
    }

    .playlist-info {
        h3, span {
            text-decoration: none !important;
        }
        
    }
}
</style>