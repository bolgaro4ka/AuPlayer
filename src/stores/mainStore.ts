import type { MusicFile } from '@/composables/useMusicPlayer';
import { defineStore } from 'pinia'
import { ref } from 'vue';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { computed } from 'vue';
import { extractMetadata, fadeOutAndStop } from '@/functions/main';




export const  useMusicPlayer = defineStore('musicPlayer', () => {
    const files = ref<MusicFile[]>([]);
    const currentAudio = ref<HTMLAudioElement | null>(null);
    const currentFile = ref<MusicFile | null>(null);
    const progress = ref(0);
    const isPlaying = ref(false);
    const duration = ref('--/--');
    const isSongPageFullScreen = ref(true);
    let activePlayId = 0;

    const name = ref<string>('');
    const author = ref<string>('');
    const imageUrl = ref<string>('');
    const title = ref<string>('')

  
    const loadFiles = async () => {
      try {
        const result = await Filesystem.readdir({
          path: '',
          directory: Directory.Documents,
        });
    
        files.value = result.files
          .filter(f => f.name.endsWith('.mp3'))
          .map(f => ({
            name: f.name,
            base64: '', // загружается позже
          }));
      } catch (err) {
        console.error('Ошибка при чтении файлов:', err);
      }
    };

    const currentIndex = computed(() =>
      files.value.findIndex(f => f.name === currentFile.value?.name)
    );
    
    const nextTrack = async () => {
      if (files.value.length === 0) return;
      const next = (currentIndex.value + 1) % files.value.length;
      await play(files.value[next]);
    };
    
    const prevTrack = async () => {
      if (files.value.length === 0) return;
      const prev = (currentIndex.value - 1 + files.value.length) % files.value.length;
      await play(files.value[prev]);
    };
    
  
    const play = async (file: MusicFile) => {
      activePlayId++; // новый идентификатор запроса
      const thisPlayId = activePlayId;
    
      await stop(); // остановить всё
    
      currentFile.value = file;
      name.value = file.name.replace('.mp3', '');

      
    
      // если base64 нет — грузим
      if (!file.base64) {
        const content = await Filesystem.readFile({
          path: file.name,
          directory: Directory.Documents,
        });
    
        // если за это время пришла новая команда на проигрывание — отмена
        if (thisPlayId !== activePlayId) return;
    
        file.base64 = `data:audio/mp3;base64,${content.data}`;
      }
    
      // снова проверяем
      if (thisPlayId !== activePlayId) return;
    
      const audio = new Audio(file.base64);
      currentAudio.value = audio;

      try {

        // Декодируем base64 в бинарный буфер
        const base64Data = file.base64!.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);

        // Создаём Blob и File
        const blob = new Blob([byteArray], { type: 'audio/mp3' });
        const fileForMetadata = new File([blob], file.name, { type: 'audio/mp3' });

        const data = await extractMetadata(fileForMetadata);
        title.value = data.title.replace('.mp3', '');
        author.value = data.artist;
        imageUrl.value = data.imageUrl;
      } catch (error) {
        console.error('Error extracting metadata:', error);
      }
    
      audio.onended = async () => {
        isPlaying.value = false;
        progress.value = 0;

        await fadeOutAndStop(audio);
        nextTrack(); // автопереход
      };
    
      audio.ontimeupdate = () => {
        if (audio.duration && isPlaying.value) {
          progress.value = (audio.currentTime / audio.duration) * 100;
          duration.value = `${String(Math.floor(audio.currentTime / 60)).padStart(2, '0')}:${String(Math.floor(audio.currentTime % 60)).padStart(2, '0')}/${String(Math.floor(audio.duration / 60)).padStart(2, '0')}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}`;
        }
      };
    
      await audio.play();
      isPlaying.value = true;
    };
    
  
    const stop =  () => {
      return new Promise<void>(async (resolve) => {
        if (currentAudio.value) {
          await fadeOutAndStop(currentAudio.value);
          currentAudio.value.pause();
          currentAudio.value.currentTime = 0;
          currentAudio.value.src = '';
          currentAudio.value.load(); // сбросить плеер
          currentAudio.value = null;
        }
        isPlaying.value = false;
        progress.value = 0;
        duration.value = '--/--';
        resolve();
      });
    };
    
  
    const togglePlay = () => {
      if (currentAudio.value) {
        if (isPlaying.value) {
          currentAudio.value.pause();
          isPlaying.value = false;
        } else {
          currentAudio.value.play();
          isPlaying.value = true;
        }
      }
    };

    const updateProgress = (event : any) => {
        isPlaying.value = false;
      if (currentAudio.value) {
        let curPercent = event.target.value;
        currentAudio.value.currentTime = curPercent * currentAudio.value.duration / 100;
      }
      isPlaying.value=true;
    }
  
    return {
      files, loadFiles, play, stop, togglePlay, currentFile, isPlaying,
      progress, duration, name, isSongPageFullScreen, updateProgress,
      nextTrack, prevTrack, currentAudio, author, imageUrl, title
    };
  }
)