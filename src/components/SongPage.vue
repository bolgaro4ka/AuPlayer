<script setup lang="ts">
import { useMusicPlayer } from '@/stores/mainStore';
import { ref, watch, onMounted, nextTick } from 'vue';
const musicPlayer = useMusicPlayer();

let startY = 0;
const dragOffset = ref(0);
const isDragging = ref(false);
const transition = ref('transform 0.3s ease'); // плавность
const threshold = window.innerHeight / 4;

const onTouchStart = (e: TouchEvent) => {
  startY = e.touches[0].clientY;
  isDragging.value = true;
  transition.value = ''; // убираем transition на момент драга
};

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  const deltaY = e.touches[0].clientY - startY;
  dragOffset.value = Math.max(0, deltaY);
};

const onTouchEnd = () => {
  isDragging.value = false;
  transition.value = 'transform 0.3s ease';

  if (dragOffset.value > threshold) {
    musicPlayer.isSongPageFullScreen = false;
  }

  dragOffset.value = 0;
};

const visualizerCanvas = ref<HTMLCanvasElement | null>(null);
let audioCtx: AudioContext | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let analyser: AnalyserNode | null = null;

function createVisualizer(audio: HTMLAudioElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  if (!sourceNode) {
    sourceNode = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 128;
  }

  if (!analyser) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);


  function draw() {
    if (!canvas || !ctx || !analyser) return;
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const average =
      dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;

    const radius = 50 + average / 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${Math.floor(average * 3)}, 80%, 60%)`;
    ctx.fill();
  }



  draw();
}


// сброс transition при открытии
watch(() => musicPlayer.isSongPageFullScreen, (val) => {
  if (val) {
    transition.value = 'transform 0.3s ease';
  }
});

onMounted(() => {
  const canvas = visualizerCanvas.value;
  if (canvas) {
    // Следим за изменением размеров канваса
    window.addEventListener('resize', () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    });
  }
});

watch(
  () => visualizerCanvas.value,
  (canvas) => {
    if (canvas && musicPlayer.isSongPageFullScreen && musicPlayer.currentAudio) {
      createVisualizer(musicPlayer.currentAudio, canvas);
    }
  }
);




watch(
  () => musicPlayer.currentAudio,
  async (newFile) => {
    console.log('opened')
    if (!newFile || !musicPlayer.currentFile) {
        console.log(`NS! ${newFile} ${musicPlayer.currentFile}`)
        return;
    }    // Проверяем, что currentAudio существует
    console.log('Started')
    const audioEl = newFile;
    const canvas = visualizerCanvas.value;

    if (canvas && audioEl) {
      // Закрываем предыдущий контекст, если есть
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
        sourceNode = null;
      }
      await audioEl.play(); // Инициализация воспроизведения
      createVisualizer(audioEl, canvas); // Запуск визуализатора
    }
  }
);

watch(
  [() => visualizerCanvas.value, () => musicPlayer.currentAudio],
  ([canvas, audio]) => {
    if (!canvas || !audio) return;

    // Пересоздаём визуализатор
    createVisualizer(audio, canvas);
  },
  { immediate: true }
);




</script>



<template>
    <div class="sp">
        <div 
        v-if="musicPlayer.isSongPageFullScreen && musicPlayer.currentFile" 
        class="sp__wrapper-full"
        :style="{
            transform: `translateY(${dragOffset}px)`,
            transition: transition
        }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        >
            <div class="sp__grabber"></div>
            <div class="sp__content">

                <div class="sp__image">
                    <img v-if="musicPlayer?.imageUrl" :src="musicPlayer?.imageUrl" alt="cover" />
                    <canvas
                        v-else
                        ref="visualizerCanvas"
                        class="sp__canvas"
                        width="200"
                        height="200"
                    ></canvas>
                </div>

                <div class="sp__name">
                    <h2>{{musicPlayer.title}}</h2>
                    <p>{{musicPlayer?.author ? musicPlayer?.author : 'Неизвестный артист'}}</p>
                </div>

                <div class="sp__player">
                    <div class="sp__timeline">
                        <input type="range" @change="musicPlayer.updateProgress" v-model="musicPlayer.progress" max="100" min="0" :style="{'--progress': `${musicPlayer.progress}%`}"/>
                        <p>{{musicPlayer.duration}}</p>
                    </div>
                    <div class="sp__controls">
                        <button class="btn btn--previous" @click="musicPlayer.prevTrack">
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M220-240v-480h80v480h-80Zm520 0L380-480l360-240v480Zm-80-240Zm0 90v-180l-136 90 136 90Z"/></svg>
                        </button>
                        <button @click="musicPlayer.togglePlay" class="btn btn--primary">
                            <svg v-if="musicPlayer.isPlaying " xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"/></svg>
                        </button>
                        <button class="btn btn--next" @click="musicPlayer.nextTrack">
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M660-240v-480h80v480h-80Zm-440 0v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="!musicPlayer.isSongPageFullScreen && musicPlayer.currentFile" class="sp__wrapper-mini">
            <div class="sp__image"  @click="musicPlayer.isSongPageFullScreen = true">

              <div class="sp__image">
                <img v-if="musicPlayer?.imageUrl" :src="musicPlayer?.imageUrl" alt="cover" style="height: 80px; width: 80px; background-size: cover;"/>
                <canvas
                    v-else
                    ref="visualizerCanvas"
                    class="sp__canvas"
                    width="200"
                    height="200"
                    style="height: 80px; width: 80px;"
                ></canvas>
            </div>

            </div>
            <div class="sp__player">

                <div class="sp__timeline">
                    <p @click="musicPlayer.isSongPageFullScreen = true">{{musicPlayer.title.length > 20 ? musicPlayer.title.slice(0, 20) + '...' : musicPlayer.title}}</p>
                    <p class="sp_author">{{musicPlayer.author.length > 20 ? musicPlayer.author.slice(0, 20) + '...' : musicPlayer.author}}</p>
                    <input type="range" @change="musicPlayer.updateProgress" v-model="musicPlayer.progress" max="100" min="0"  :style="{'--progress': `${musicPlayer.progress}%`}"/>
                    <p>{{musicPlayer.duration}}</p>
                </div>
                
            </div>
            <div class="sp__controls">
                <button class="btn btn--previous" @click="musicPlayer.prevTrack">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M220-240v-480h80v480h-80Zm520 0L380-480l360-240v480Zm-80-240Zm0 90v-180l-136 90 136 90Z"/></svg>
                </button>
                <button @click="musicPlayer.togglePlay" class="btn btn--primary">
                  <svg v-if="musicPlayer.isPlaying " xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"/></svg>
                </button>
                <button class="btn btn--next" @click="musicPlayer.nextTrack">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M660-240v-480h80v480h-80Zm-440 0v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z"/></svg>
                </button>
                
            </div>
        </div>
        <div v-else>

        </div>
    </div>
</template>

<style lang="scss" scoped>
.sp__wrapper-full {
    position: fixed;
    transition: transform 0.1s;
    will-change: transform;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    z-index: 10;

    background: #121212;
    color: #fff;

    .sp__content {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .sp__image {
          width: 100%;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            width: 80vw;
          }
        }

        .sp__timeline p {
          text-align: end;
        }


        input[type="range"] {
          -webkit-appearance: none;
          width: 80vw;
          height: 8px;
          margin-top: 5px;
          margin-bottom: 5px;
          background: transparent; /* убираем стандартный фон */
          position: relative;
        }
        
        /* Пройденная часть трека */
        input[type="range"]::-webkit-slider-runnable-track {
          height: 8px;
          background: linear-gradient(to right,  #333 var(--progress), #414141 var(--progress));
          border-radius: 2px;
          transition: background 0.3s;
        }
        
        /* Тумблер */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #333;
          border-radius: 50%;
          cursor: pointer;
          margin-top: -8px; /* чтобы выровнять по центру трека */
          transition: background 0.3s;
        }
        
        /* Firefox */
        input[type="range"]::-moz-range-track {
          height: 8px;
          background: #414141;
          border-radius: 2px;
        }
        
        input[type="range"]::-moz-range-progress {
          background: #333;
          height: 8px;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #333;
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }
        

          .sp__controls {
            height: 200px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;

            .btn--previous, .btn--next {
              background-color: #333;
              border: none;
              width: 50px;
              height: 50px;
              border-radius: 10000px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .btn--primary {
              background-color: #333;
              border: none;
              width: 80px;
              height: 80px;
              border-radius: 10000px;
              display: flex;
              align-items: center;
              justify-content: center;
            }


          }
        
        }
        

    .sp__grabber {
        width: 50px;
        height: 5px;
        background: #999;
        border-radius: 3px;
        margin: 10px auto;
      }

    .sp__name {
        text-align: center;
    }
      
    
}

.sp__wrapper-mini {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    background: #000;
    z-index: 10;
    height: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;
    padding-right: 10px;

    .sp_author {
      font-size: 8px;
      color: #aaa;
    }

    .sp__image {
        width: 80px !important;
        height: 80px !important;
    }

    .sp__controls {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .sp__player {
        padding-left: 5px;
        padding-right: 5px;
        width: 100%;

        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          margin-top: 8px;
          margin-bottom: 8px;
          background: transparent; /* убираем стандартный фон */
          position: relative;
        }
        
        /* Пройденная часть трека */
        input[type="range"]::-webkit-slider-runnable-track {
          height: 8px;
          background: linear-gradient(to right,  #333 var(--progress), #414141 var(--progress));
          border-radius: 2px;
          transition: background 0.3s;
        }
        
        /* Тумблер */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #333;
          border-radius: 50%;
          cursor: pointer;
          margin-top: -8px; /* чтобы выровнять по центру трека */
          transition: background 0.3s;
        }
        
        /* Firefox */
        input[type="range"]::-moz-range-track {
          height: 8px;
          background: #414141;
          border-radius: 2px;
        }
        
        input[type="range"]::-moz-range-progress {
          background: #333;
          height: 8px;
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #333;
          border-radius: 50%;
          border: none;
          cursor: pointer;
        }
    }
      
      

        .sp__controls {
          height: 200px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;

          .btn--previous, .btn--next {
            background-color: transparent;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 10000px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .btn--primary {
            background-color: transparent;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 10000px;
            display: flex;
            align-items: center;
            justify-content: center;
          }


        }
      
      }
  


  .sp__canvas {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(#222, #111);
  }
  
</style>