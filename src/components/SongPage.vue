<script setup lang="ts">
import { useMusicPlayer } from '@/stores/mainStore';
import { ref, watch, type Ref } from 'vue';
import Visualizer from './Visualizer.vue';
import GRange from './particles/GRange.vue';
import { setTheme } from '@/functions/colors';
import PlayButton from './PlayButton.vue';

const musicPlayer = useMusicPlayer();

let startY = 0;
const dragOffset = ref(0);
const isDragging = ref(false);
const transition = ref('transform 0.3s ease'); // плавность
const threshold = window.innerHeight / 4;

const imageComponent : Ref<HTMLImageElement | null> = ref(null);



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


// сброс transition при открытии
watch(() => musicPlayer.isSongPageFullScreen, (val) => {
    if (val) {
        transition.value = 'transform 0.3s ease';
    }
});


watch(
    [() => imageComponent.value, ],
    ([image]) => {
        if (image) {
            setTheme('dark', image);
        }
    }

)

function handleNext() {
    musicPlayer.nextTrack(); 
    setTheme('dark', imageComponent.value)
}

function handlePrev() {
    musicPlayer.prevTrack(); 
    setTheme('dark', imageComponent.value)
}


</script>



<template>
    <div class="sp">
        <div v-show="musicPlayer.isSongPageFullScreen && musicPlayer.currentFile" class="sp__wrapper-full" :style="{
            transform: `translateY(${dragOffset}px)`,
            transition: transition
        }" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
            <div class="sp__grabber"></div>
            <div class="sp__content">

                <div class="sp__image">
                    <img ref="imageComponent" v-if="musicPlayer?.imageUrl" :src="musicPlayer?.imageUrl" alt="cover" />
                    <Visualizer v-else :mode="1" :isAnimated="!musicPlayer.isPlaying" />
                </div>

                <div class="sp__name">
                    <h2>{{ musicPlayer.title }}</h2>
                    <p>{{ musicPlayer?.author ? musicPlayer?.author : 'Неизвестный артист' }}</p>
                </div>

                <div class="sp__player">
                    <div class="sp__timeline">
                        <GRange v-model="musicPlayer.progress" @change="musicPlayer.updateProgress"
                            :pauseAnimation="!musicPlayer.isPlaying" :inactiveColor="musicPlayer.colors.outline"
                            :thumbBorderColor="musicPlayer.colors.background" :color="musicPlayer.colors.secondary" />
                        <p>{{ musicPlayer.duration }}</p>
                    </div>
                    <div class="sp__controls">
                        <button class="btn btn--previous" @click="handlePrev">
                            <svg class="btn__bg btn__bg--noanim" style="transform: rotate(-90deg);"
                                xmlns="http://www.w3.org/2000/svg" width="380" height="380" viewBox="0 0 380 380"
                                fill="var(--secondary-color)">
                                <path
                                    d="M262.422 104.907C253.213 90.2936 243.84 75.4777 231.389 63.8739C218.938 52.2412 202.808 44.023 186.27 45.0937C171.748 46.0486 158.288 54.0932 147.662 64.5974C137.036 75.1015 128.781 88.0365 120.661 100.856C98.7011 135.464 76.7136 170.073 54.7533 204.711C44.3181 221.147 33.6105 238.307 30.7224 257.898C27.2349 281.568 36.6348 305.673 53.3093 321.415C70.7467 337.88 99.0008 336.549 120.225 332.035C143.493 327.086 166.244 317.769 189.975 317.797C210.301 317.797 229.945 324.685 249.726 329.691C269.479 334.668 290.704 337.735 309.776 330.327C333.453 321.154 350.454 295.082 349.991 268.315C349.555 243.892 323.508 201.759 323.508 201.759C323.508 201.759 282.78 137.194 262.422 104.907Z"
                                    fill="var(--secondary-color)" />
                            </svg>
                            <span class="btn__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
                                    width="24px" fill="var(--background-color)">
                                    <path
                                        d="M220-240v-480h80v480h-80Zm520 0L380-480l360-240v480Zm-80-240Zm0 90v-180l-136 90 136 90Z" />
                                </svg>
                            </span>
                        </button>
                        <PlayButton />
                        <button class="btn btn--next" @click="handleNext">
                            <svg class="btn__bg btn__bg--noanim" style="transform: rotate(90deg);"
                                xmlns="http://www.w3.org/2000/svg" width="380" height="380" viewBox="0 0 380 380"
                                fill="var(--secondary-color)">
                                <path
                                    d="M262.422 104.907C253.213 90.2936 243.84 75.4777 231.389 63.8739C218.938 52.2412 202.808 44.023 186.27 45.0937C171.748 46.0486 158.288 54.0932 147.662 64.5974C137.036 75.1015 128.781 88.0365 120.661 100.856C98.7011 135.464 76.7136 170.073 54.7533 204.711C44.3181 221.147 33.6105 238.307 30.7224 257.898C27.2349 281.568 36.6348 305.673 53.3093 321.415C70.7467 337.88 99.0008 336.549 120.225 332.035C143.493 327.086 166.244 317.769 189.975 317.797C210.301 317.797 229.945 324.685 249.726 329.691C269.479 334.668 290.704 337.735 309.776 330.327C333.453 321.154 350.454 295.082 349.991 268.315C349.555 243.892 323.508 201.759 323.508 201.759C323.508 201.759 282.78 137.194 262.422 104.907Z"
                                    fill="var(--secondary-color)" />
                            </svg>
                            <span class="btn__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960"
                                    width="24px" fill="var(--background-color)">
                                    <path
                                        d="M660-240v-480h80v480h-80Zm-440 0v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z" />
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-show="!musicPlayer.isSongPageFullScreen && musicPlayer.currentFile" class="sp__wrapper-mini">
            <div class="sp__image" @click="musicPlayer.isSongPageFullScreen = true">

                <div class="sp__image">
                    <img v-if="musicPlayer?.imageUrl" :src="musicPlayer?.imageUrl" alt="cover"
                        style="height: 80px; width: 80px; background-size: cover;" />
                    <Visualizer v-else :mode="1" :isAnimated="!musicPlayer.isPlaying" />
                </div>

            </div>
            <div class="sp__player">

                <div class="sp__timeline">
                    <p @click="musicPlayer.isSongPageFullScreen = true">{{ musicPlayer.title.length > 20 ?
                        musicPlayer.title.slice(0, 20) + '...' : musicPlayer.title }}</p>
                    <p class="sp_author">{{ musicPlayer.author.length > 20 ? musicPlayer.author.slice(0, 20) + '...' :
                        musicPlayer.author }}</p>
                    <GRange v-model="musicPlayer.progress" @change="musicPlayer.updateProgress"
                        :pauseAnimation="!musicPlayer.isPlaying" :inactiveColor="musicPlayer.colors.outline"
                        :thumbBorderColor="musicPlayer.colors.background" :color="musicPlayer.colors.secondary" :height="20" :amplitude="4" />
                    <p>{{ musicPlayer.duration }}</p>
                </div>

            </div>
            <div class="sp__controls">
                <button class="btn btn--previous" @click="musicPlayer.prevTrack">

                    <span class="btn__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                            fill="#e8eaed">
                            <path
                                d="M220-240v-480h80v480h-80Zm520 0L380-480l360-240v480Zm-80-240Zm0 90v-180l-136 90 136 90Z" />
                        </svg>
                    </span>
                </button>
                <button @click="musicPlayer.togglePlay" class="btn btn--primary">
                    <template v-if="musicPlayer.isPlaying">
                        <svg class="btn__bg" xmlns="http://www.w3.org/2000/svg" width="380" height="380"
                            viewBox="0 0 380 380" fill="none">
                            <path
                                d="M154.828 43.2756C156.574 41.8498 157.448 41.1369 158.245 40.535C177.03 26.3548 202.97 26.3548 221.755 40.535C222.552 41.1369 223.425 41.8498 225.172 43.2756C225.952 43.9121 226.342 44.2303 226.727 44.5333C235.567 51.4788 246.406 55.4147 257.652 55.7636C258.143 55.7788 258.647 55.785 259.654 55.7975C261.911 55.8255 263.039 55.8395 264.037 55.8898C287.563 57.0742 307.435 73.7107 312.689 96.6205C312.912 97.5928 313.121 98.6991 313.541 100.911C313.728 101.899 313.822 102.393 313.922 102.872C316.219 113.862 321.986 123.828 330.377 131.308C330.743 131.635 331.125 131.962 331.888 132.618C333.599 134.087 334.454 134.821 335.187 135.5C352.445 151.495 356.95 176.983 346.215 197.903C345.76 198.791 345.208 199.773 344.104 201.737C343.611 202.613 343.364 203.052 343.132 203.483C337.812 213.375 335.809 224.708 337.418 235.82C337.488 236.304 337.569 236.8 337.732 237.792C338.096 240.014 338.278 241.125 338.402 242.115C341.318 265.436 328.347 287.851 306.647 296.991C305.726 297.379 304.67 297.778 302.559 298.574C301.617 298.929 301.146 299.107 300.69 299.289C290.241 303.455 281.406 310.852 275.48 320.395C275.221 320.811 274.964 321.243 274.449 322.107C273.297 324.043 272.721 325.011 272.178 325.849C259.387 345.584 235.011 354.436 212.498 347.521C211.543 347.228 210.477 346.856 208.347 346.112C207.396 345.78 206.921 345.614 206.455 345.461C195.767 341.951 184.233 341.951 173.545 345.461C173.079 345.614 172.603 345.78 171.652 346.112C169.522 346.856 168.457 347.228 167.502 347.521C144.989 354.436 120.613 345.584 107.822 325.849C107.279 325.011 106.703 324.043 105.55 322.107C105.036 321.243 104.779 320.811 104.52 320.395C98.5939 310.852 89.7583 303.455 79.3096 299.289C78.8539 299.107 78.3827 298.929 77.4404 298.574C75.3294 297.778 74.274 297.379 73.3529 296.991C51.6523 287.851 38.6819 265.436 41.598 242.115C41.7218 241.125 41.9039 240.014 42.2682 237.792C42.4308 236.8 42.5121 236.304 42.5822 235.82C44.1908 224.708 42.188 213.375 36.8675 203.483C36.6354 203.052 36.389 202.613 35.8962 201.737C34.7921 199.773 34.2401 198.791 33.7845 197.903C23.0499 176.983 27.5544 151.495 44.8128 135.5C45.5454 134.821 46.4007 134.087 48.1113 132.618C48.875 131.962 49.2568 131.635 49.6228 131.308C58.0134 123.828 63.7804 113.862 66.0777 102.872C66.1779 102.393 66.2715 101.899 66.4588 100.911C66.8783 98.699 67.088 97.5928 67.311 96.6204C72.5652 73.7107 92.4369 57.0742 115.962 55.8898C116.961 55.8395 118.089 55.8255 120.346 55.7975C121.353 55.785 121.857 55.7788 122.347 55.7636C133.594 55.4147 144.432 51.4788 153.272 44.5333C153.658 44.2303 154.048 43.9121 154.828 43.2756Z"
                                fill="var(--secondary-color)" />
                        </svg>
                        <span class="btn__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                                fill="#e8eaed">
                                <path
                                    d="M520-200v-560h240v560H520Zm-320 0v-560h240v560H200Zm400-80h80v-400h-80v400Zm-320 0h80v-400h-80v400Zm0-400v400-400Zm320 0v400-400Z" />
                            </svg>
                        </span>
                    </template>
                    <template v-else>
                        <svg class="btn__bg btn__bg-stop" xmlns="http://www.w3.org/2000/svg" width="380" height="380"
                            viewBox="0 0 380 380" fill="none">
                            <path
                                d="M154.828 43.2756C156.574 41.8498 157.448 41.1369 158.245 40.535C177.03 26.3548 202.97 26.3548 221.755 40.535C222.552 41.1369 223.425 41.8498 225.172 43.2756C225.952 43.9121 226.342 44.2303 226.727 44.5333C235.567 51.4788 246.406 55.4147 257.652 55.7636C258.143 55.7788 258.647 55.785 259.654 55.7975C261.911 55.8255 263.039 55.8395 264.037 55.8898C287.563 57.0742 307.435 73.7107 312.689 96.6205C312.912 97.5928 313.121 98.6991 313.541 100.911C313.728 101.899 313.822 102.393 313.922 102.872C316.219 113.862 321.986 123.828 330.377 131.308C330.743 131.635 331.125 131.962 331.888 132.618C333.599 134.087 334.454 134.821 335.187 135.5C352.445 151.495 356.95 176.983 346.215 197.903C345.76 198.791 345.208 199.773 344.104 201.737C343.611 202.613 343.364 203.052 343.132 203.483C337.812 213.375 335.809 224.708 337.418 235.82C337.488 236.304 337.569 236.8 337.732 237.792C338.096 240.014 338.278 241.125 338.402 242.115C341.318 265.436 328.347 287.851 306.647 296.991C305.726 297.379 304.67 297.778 302.559 298.574C301.617 298.929 301.146 299.107 300.69 299.289C290.241 303.455 281.406 310.852 275.48 320.395C275.221 320.811 274.964 321.243 274.449 322.107C273.297 324.043 272.721 325.011 272.178 325.849C259.387 345.584 235.011 354.436 212.498 347.521C211.543 347.228 210.477 346.856 208.347 346.112C207.396 345.78 206.921 345.614 206.455 345.461C195.767 341.951 184.233 341.951 173.545 345.461C173.079 345.614 172.603 345.78 171.652 346.112C169.522 346.856 168.457 347.228 167.502 347.521C144.989 354.436 120.613 345.584 107.822 325.849C107.279 325.011 106.703 324.043 105.55 322.107C105.036 321.243 104.779 320.811 104.52 320.395C98.5939 310.852 89.7583 303.455 79.3096 299.289C78.8539 299.107 78.3827 298.929 77.4404 298.574C75.3294 297.778 74.274 297.379 73.3529 296.991C51.6523 287.851 38.6819 265.436 41.598 242.115C41.7218 241.125 41.9039 240.014 42.2682 237.792C42.4308 236.8 42.5121 236.304 42.5822 235.82C44.1908 224.708 42.188 213.375 36.8675 203.483C36.6354 203.052 36.389 202.613 35.8962 201.737C34.7921 199.773 34.2401 198.791 33.7845 197.903C23.0499 176.983 27.5544 151.495 44.8128 135.5C45.5454 134.821 46.4007 134.087 48.1113 132.618C48.875 131.962 49.2568 131.635 49.6228 131.308C58.0134 123.828 63.7804 113.862 66.0777 102.872C66.1779 102.393 66.2715 101.899 66.4588 100.911C66.8783 98.699 67.088 97.5928 67.311 96.6204C72.5652 73.7107 92.4369 57.0742 115.962 55.8898C116.961 55.8395 118.089 55.8255 120.346 55.7975C121.353 55.785 121.857 55.7788 122.347 55.7636C133.594 55.4147 144.432 51.4788 153.272 44.5333C153.658 44.2303 154.048 43.9121 154.828 43.2756Z"
                                fill="var(--secondary-color)" />
                        </svg>
                        <svg class="btn-bg btn-res" xmlns="http://www.w3.org/2000/svg" width="380" height="380"
                            viewBox="0 0 380 380" fill="none">
                            <path
                                d="M350 190C350 278.366 278.366 350 190 350C101.634 350 30 278.366 30 190C30 101.634 101.634 30 190 30C278.366 30 350 101.634 350 190Z"
                                fill="var(--secondary-color)" />
                        </svg>
                        <span class="btn__icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                                fill="#e8eaed">
                                <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z" />
                            </svg>
                        </span>
                    </template>
                </button>
                <button class="btn btn--next" @click="musicPlayer.nextTrack">

                    <span class="btn__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                            fill="#e8eaed">
                            <path
                                d="M660-240v-480h80v480h-80Zm-440 0v-480l360 240-360 240Zm80-240Zm0 90 136-90-136-90v180Z" />
                        </svg>
                    </span>
                </button>
            </div>
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

    background: var(--background-color);
    color: var(--text-primary-color);

    .sp__content {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .sp__image {
            width: 80vw;
            height: 80vw;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .sp__timeline p {
            text-align: end;
            width: 100%;
        }

        .sp__timeline {
            max-width: 100%;
            width: 80vw;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            contain: layout;
            border: 1px solid transparent;

        }


        .sp__controls {
            height: 200px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;

            .btn--previous,
            .btn--next {
                background-color: #333;
                border: none;
                width: 50px;
                height: 50px;
                border-radius: 10000px;
                display: flex;
                align-items: center;
                justify-content: center;
            }



            .btn {
                position: relative;
                width: 60px;
                height: 60px;
                border: none;
                background: none;
                padding: 0;
            }

            .btn--primary {
                width: 120px !important;
                height: 120px !important;
            }

            .btn__bg {
                position: absolute;
                inset: 0;
                z-index: 1;
                width: 100%;
                height: 100%;
                fill: var(--triary-color);
                animation: rotate 4s linear infinite;
            }

            .btn__bg--noanim {
                animation: none;
            }

            .btn__bg-stop {
                animation: rotate 0.2s linear 1;
                transform: scale(0.95);
            }

            .btn-res {
                position: absolute;
                inset: 0;
                z-index: 1;
                width: 100%;
                height: 100%;
                fill: var(--triary-color);
                animation: fill-resize 0.1s linear 1;
            }

            .btn__icon {
                position: relative;
                z-index: 2;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
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
    bottom: calc(60px + env(safe-area-inset-bottom));
    left: 0;
    width: 100vw;
    background: var(--surface-color);
    z-index: 10;
    height: 100px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 10px;
    padding-right: 10px;

    .sp__image {
        width: 80px;
        height: 80px;
        background-size: cover;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
    }

    .sp_author {
        font-size: 8px;
        color: var(--text-secondary-color);
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

    }



    .sp__controls {
        height: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;

        .btn--previous,
        .btn--next {
            border: none;
            width: 20px;
            height: 20px;
            border-radius: 10000px;
            display: flex;
            align-items: center;
            justify-content: center;
        }



        .btn {
            position: relative;
            width: 40px;
            height: 40px;
            border: none;
            background: none;
            padding: 0;
        }

        .btn--primary {
            width: 60px !important;
            height: 60px !important;
        }

        .btn__bg {
            position: absolute;
            inset: 0;
            z-index: 1;
            width: 100%;
            height: 100%;
            fill: var(--triary-color);
            animation: rotate 4s linear infinite;
        }

        .btn__bg--noanim {
            animation: none;
        }

        .btn__bg-stop {
            animation: rotate 0.2s linear 1;
            transform: scale(0.95);
        }

        .btn-res {
            position: absolute;
            inset: 0;
            z-index: 1;
            width: 100%;
            height: 100%;
            fill: #6750A4;
            animation: fill-resize 0.1s linear 1;
        }

        .btn__icon {
            position: relative;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
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