// stores/mainStore.ts
import type { MusicFile } from '@/composables/useMusicPlayer'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Filesystem } from '@capacitor/filesystem'
import { Preferences } from '@capacitor/preferences'
import { extractMetadata, fadeOutAndStop } from '@/functions/main'

export const useMusicPlayer = defineStore('musicPlayer', () => {
  const files = ref<MusicFile[]>([])
  const currentAudio = ref<HTMLAudioElement | null>(null)
  const currentFile = ref<MusicFile | null>(null)
  const progress = ref(0)
  const isPlaying = ref(false)
  const duration = ref('--/--')
  const isSongPageFullScreen = ref(true)
  let activePlayId = 0

  const name = ref<string>('')
  const author = ref<string>('')
  const imageUrl = ref<string>('')
  const title = ref<string>('')

  const biteColor = ref<string>('')

  const playlists = ref<{ id: string; name: string; image?: string; trackPaths: string[] }[]>([])
  const currentPlaylist = ref<{ id: string; trackPaths: string[] } | null>(null)

  const addPlaylist = (name: string, image: string | undefined, trackPaths: string[]) => {
    playlists.value.push({
      id: Date.now().toString(),
      name,
      image,
      trackPaths,
    })
    savePlaylists()
  }

  const loadPlaylists = async () => {
    const { value } = await Preferences.get({ key: 'playlists' })
    if (value) playlists.value = JSON.parse(value)
  }
  
  const savePlaylists = async () => {
    await Preferences.set({
      key: 'playlists',
      value: JSON.stringify(playlists.value)
    })
  }

  const getTracksFromPlaylist = (playlistId: string) => {
    const playlist = playlists.value.find(p => p.id === playlistId)
    return playlist?.trackPaths.map(path => files.value.find(f => f.path === path)).filter(Boolean) as MusicFile[]
  }


  const loadMusicFromDirectories = async () => {
    try {
      console.log('Start loadMusicFromDirectories()')
      const { value } = await Preferences.get({ key: 'directories' })
      if (!value) return

      const dirs: string[] = JSON.parse(value)
      const allFiles: MusicFile[] = []

      for (const dir of dirs) {
        try {
          const result = await Filesystem.readdir({
            path: dir,
            directory: undefined,
          })

          const mp3Files = result.files
            .filter(f => f.name.endsWith('.mp3'))
            .map(f => ({
              name: f.name,
              title: '',
              author: '',
              base64: '',
              imageUrl: '',
              isImageLoaded: false,
              path: `${dir}/${f.name}`
            }))

          allFiles.push(...mp3Files)
        } catch (e) {
          console.log('Ошибка при чтении директории', dir, e)
        }
      }

      console.log('DELETING DUBS')

      // Убираем дубликаты
      const uniqueFilesMap = new Map<string, MusicFile>()
      allFiles.forEach(file => {
        const key = file.path ?? file.name
        if (!uniqueFilesMap.has(key)) {
          uniqueFilesMap.set(key, file)
        }
      })

      files.value = Array.from(uniqueFilesMap.values())

      // Загружаем только метаданные в фоне
      console.log('LOAD METADATA')
      for (const file of files.value) {
        await loadMetadataWithCache(file)
      }

      console.log('END loadMusicFromDirectories()')
      console.log('FILES:', files.value)
    } catch (e) {
      console.error('Ошибка при загрузке директорий:', e)
    }
  }

  const loadMetadataWithCache = async (file: MusicFile) => {
    const cacheKey = `meta:${file.name}`;
    try {
      const cache = await Preferences.get({ key: cacheKey });
      if (cache.value) {
        const meta = JSON.parse(cache.value);
        file.title = meta.title;
        file.author = meta.author;
        file.imageUrl = meta.imageUrl;
        file.isImageLoaded = !!meta.imageUrl;
        return;
      }
  
      // Загружаем base64 только если нужно
      const content = await Filesystem.readFile({
        path: 'file://' + file.path,
        directory: undefined,
      });
  
      file.base64 = `data:audio/mp3;base64,${content.data}`;
      const blob = await fetch(file.base64).then(res => res.blob());
      const fileObj = new File([blob], file.name, { type: 'audio/mp3' });
  
      const meta = await extractMetadata(fileObj);
      file.title = meta.title;
      file.author = meta.artist;
      file.imageUrl = meta.imageUrl;
      file.isImageLoaded = !!meta.imageUrl;
  
      // Сохраняем в Preferences
      await Preferences.set({
        key: cacheKey,
        value: JSON.stringify({
          title: file.title,
          author: file.author,
          imageUrl: file.imageUrl,
        }),
      });
  
      // Удаляем base64 чтобы не держать в памяти
      file.base64 = '';
    } catch (e) {
      console.warn('Ошибка метаданных:', file.name, e);
      file.title = file.name.replace('.mp3', '');
      file.author = 'Неизвестный автор';
      file.imageUrl = '';
    }
  };
  

  // Только метаданные
  // const loadFileMetadata = async (file: MusicFile) => {
  //   try {
  //     file.title = file.name.replace('.mp3', '')
  //     file.author = 'Неизвестный автор'
  //     file.imageUrl = ''
  //   } catch (e) {
  //     console.warn(`Ошибка при загрузке метаданных: ${file.name}`, e)
  //   }
  // }
  

  const getCurrentPlaylistFiles = computed(() => {
    if (!currentPlaylist.value) return files.value
    return currentPlaylist.value.trackPaths.map(p => files.value.find(f => f.path === p)).filter(Boolean) as MusicFile[]
  })
  
  const currentIndex = computed(() =>
    getCurrentPlaylistFiles.value.findIndex(f => f.name === currentFile.value?.name)
  )
  
  const nextTrack = async () => {
    const playlistFiles = getCurrentPlaylistFiles.value
    if (!playlistFiles.length) return
    
    const currentIdx = currentIndex.value
    const nextIdx = (currentIdx + 1) % playlistFiles.length
    await play(playlistFiles[nextIdx])
  }
  
  const prevTrack = async () => {
    const playlistFiles = getCurrentPlaylistFiles.value
    if (!playlistFiles.length) return
    
    const currentIdx = currentIndex.value
    const prevIdx = (currentIdx - 1 + playlistFiles.length) % playlistFiles.length
    await play(playlistFiles[prevIdx])
  }

  // stores/mainStore.ts
  const removeTrackFromPlaylist = (playlistId: string, trackPath: string) => {
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (playlist) {
      playlist.trackPaths = playlist.trackPaths.filter(p => p !== trackPath)
      savePlaylists()
    }
  }

  const addTrackToPlaylist = (playlistId: string, trackPath: string) => {
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (playlist && !playlist.trackPaths.includes(trackPath)) {
      playlist.trackPaths.push(trackPath)
      savePlaylists()
    }
  }

  const play = async (file: MusicFile) => {

    if (currentPlaylist.value) {
      const playlistIndex = playlists.value.findIndex(p => p.id === currentPlaylist.value?.id)
      if (playlistIndex > -1) {
        currentPlaylist.value = playlists.value[playlistIndex]
      }
    }

    activePlayId++
    const thisPlayId = activePlayId

    await stop()

    name.value = file.title || file.name.replace('.mp3', '')
    author.value = file.author || 'Неизвестный автор'
    imageUrl.value = file.imageUrl || ''
    title.value = file.title || ''

    // Только теперь читаем песню
    if (!file.base64) {
      const content = await Filesystem.readFile({
        path: 'file://' + file.path,
        directory: undefined,
      })
      if (thisPlayId !== activePlayId) return
      file.base64 = `data:audio/mp3;base64,${content.data}`
    }

    currentFile.value = file


    if (thisPlayId !== activePlayId) return

    const audio = new Audio(file.base64)
    currentAudio.value = audio

    audio.onended = async () => {
      isPlaying.value = false
      progress.value = 0
      await fadeOutAndStop(audio)
      nextTrack()
    }

    audio.ontimeupdate = () => {
      if (audio.duration && isPlaying.value) {
        progress.value = (audio.currentTime / audio.duration) * 100
        duration.value = `${String(Math.floor(audio.currentTime / 60)).padStart(2, '0')}:${String(Math.floor(audio.currentTime % 60)).padStart(2, '0')}/${String(Math.floor(audio.duration / 60)).padStart(2, '0')}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}`
      }
    }

    await audio.play()
    isPlaying.value = true
  }

  const stop = () => {
    return new Promise<void>(async (resolve) => {
      if (currentAudio.value) {
        await fadeOutAndStop(currentAudio.value)
        currentAudio.value.pause()
        currentAudio.value.currentTime = 0
        currentAudio.value.src = ''
        currentAudio.value.load()
        currentAudio.value = null
      }
      isPlaying.value = false
      progress.value = 0
      duration.value = '--/--'
      resolve()
    })
  }

  const togglePlay = () => {
    if (currentAudio.value) {
      if (isPlaying.value) {
        currentAudio.value.pause()
        isPlaying.value = false
      } else {
        currentAudio.value.play()
        isPlaying.value = true
      }
    }
  }

  const updateProgress = (event: any) => {
    isPlaying.value = false
    if (currentAudio.value) {
      const curPercent = event.target.value
      currentAudio.value.currentTime = curPercent * currentAudio.value.duration / 100
    }
    isPlaying.value = true
  }

  loadPlaylists()

  return {
    files,
    loadMusicFromDirectories,
    play,
    stop,
    togglePlay,
    currentFile,
    isPlaying,
    progress,
    duration,
    name,
    isSongPageFullScreen,
    updateProgress,
    nextTrack,
    prevTrack,
    currentAudio,
    author,
    imageUrl,
    title,
    biteColor,
    playlists,
    addPlaylist,
    getTracksFromPlaylist,
    currentPlaylist,
    loadPlaylists,
    savePlaylists,
    removeTrackFromPlaylist,
    addTrackToPlaylist

  }
})
