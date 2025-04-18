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

function createVisualizer(audio: HTMLAudioElement, canvas: HTMLCanvasElement) {
    console.log('start painting')
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  audioCtx = new AudioContext();
  const analyser = audioCtx.createAnalyser();
  const source = audioCtx.createMediaElementSource(audio);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 128;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    if (!canvas || !ctx) return;
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const average =
      dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;

    const radius = 50 + average / 2;
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
      if (audioCtx) audioCtx.close();
      await audioEl.play(); // Инициализация воспроизведения
      createVisualizer(audioEl, canvas); // Запуск визуализатора
    }
  }
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
                    <img v-if="musicPlayer.imageUrl" :src="musicPlayer.imageUrl" alt="cover" />
                    <canvas
                        v-else
                        ref="visualizerCanvas"
                        class="sp__canvas"
                        width="200"
                        height="200"
                    ></canvas>
                </div>

                <div class="sp__name">
                    <h2>{{musicPlayer.name}}</h2>
                </div>

                <div class="sp__player">
                    <div class="sp__timeline">
                        <input type="range" @change="musicPlayer.updateProgress" v-model="musicPlayer.progress" max="100" min="0" />
                        <p>{{musicPlayer.duration}}</p>
                    </div>
                    <div class="sp__controls">
                        <button class="btn btn--previous" @click="musicPlayer.prevTrack">⏮</button>
                        <button @click="musicPlayer.togglePlay" class="btn btn--primary">
                            {{ musicPlayer.isPlaying ? '⏸' : '▶️' }}
                        </button>
                        <button class="btn btn--next" @click="musicPlayer.nextTrack">⏭</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-else-if="!musicPlayer.isSongPageFullScreen && musicPlayer.currentFile" class="sp__wrapper-mini">
            <div class="sp__image"  @click="musicPlayer.isSongPageFullScreen = true">

            </div>
            <div class="sp__player">

                <div class="sp__timeline">
                    <p @click="musicPlayer.isSongPageFullScreen = true">{{musicPlayer.name}}</p>
                    <input type="range" @change="musicPlayer.updateProgress" v-model="musicPlayer.progress" max="100" min="0" />
                    <p>{{musicPlayer.duration}}</p>
                </div>
                
            </div>
            <div class="sp__controls">
                <button class="btn btn--previous" @click="musicPlayer.prevTrack">⏮</button>
                <button @click="musicPlayer.togglePlay" class="btn btn--primary">
                    {{ musicPlayer.isPlaying ? '⏸' : '▶️' }}
                </button>
                <button class="btn btn--next" @click="musicPlayer.nextTrack">⏭</button>
                
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

        input[type="range"] {
            width: 80vw;
            height: 4px;
            background: #fff;
            border-radius: 2px;
            outline: none;
            transition: background 0.3s;
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

    .sp__image {
        width: 80px !important;
        height: 80px !important;
        background: #fff;
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

        input {
            width: 100%;
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