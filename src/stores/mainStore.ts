// stores/mainStore.ts
import type { MusicFile } from "@/composables/useMusicPlayer";
import { defineStore } from "pinia";
import { ref, computed, type Ref } from "vue";

import { Filesystem } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";
import { extractMetadata, fadeOutAndStop } from "@/functions/main";

import { AudioPlayer } from "@mediagrid/capacitor-native-audio";

const typesOfFormats = ["mp3", "ogg", "wav"];

function generateAudioId(): string {
    return Math.ceil(Math.random() * 10000000).toString();
}

export const useMusicPlayer = defineStore("musicPlayer", () => {
    const files = ref<MusicFile[]>([]);
    const currentAudio = ref<HTMLAudioElement | null>(null);
    const currentFile = ref<MusicFile | null>(null);
    const progress = ref(0);
    const isPlaying = ref(false);
    const duration = ref("--/--");
    const isSongPageFullScreen = ref(true);

    const volume = ref(1);

    const audioId = ref("0");

    const name = ref<string>("");
    const isInitialized = ref(false);
    const author = ref<string>("");
    const imageUrl = ref<string>("");
    const title = ref<string>("");

    const biteColor = ref<string>("");

    let currentPositionIntervalId: any;

    const playlists = ref<
        { id: string; name: string; image?: string; trackPaths: string[] }[]
    >([]);
    const currentPlaylist: Ref<{
        id: string;
        name: string;
        trackPaths: string[];
    } | null> = ref(null);

    const _changeCurrentFile = (file : MusicFile) => {
        name.value = file.title || file.name.replace(".mp3", "");
        author.value = file.author || "Неизвестный автор";
        imageUrl.value = file.imageUrl || "";
        title.value = file.title || "";

        currentFile.value = file;
    }

    async function initialize(src: string, title: string = "No title", albumTitle : string | undefined = undefined, artistName : string | undefined = undefined): Promise<void> {
        isInitialized.value = true;
        audioId.value = generateAudioId();

        await AudioPlayer.create({
            audioId: audioId.value,
            audioSource: src,
            albumTitle: albumTitle,
            artistName: artistName,
            friendlyTitle: albumTitle || title,
            useForNotification: true,
            isBackgroundMusic: false,
            loop: false,
            showSeekForward: true,
            showSeekBackward: true,
            seekBackwardTime: 1,
            seekForwardTime: 1,
        }).catch((ex: Error) => console.log(ex.message));

        console.log("created!", audioId.value);

        AudioPlayer.onAudioEnd(
            { audioId: audioId.value },
            async () => {
                await nextTrack();
            },
        );

        AudioPlayer.onPlaybackStatusChange(
            { audioId: audioId.value },
            (result) => {
                switch (result.status) {
                    case "playing":
                        AudioPlayer.play({ audioId: audioId.value });

                        break;
                    case "paused":
                        AudioPlayer.pause({ audioId: audioId.value });

                        break;
                    case "stopped":
                        AudioPlayer.stop({ audioId: audioId.value });
                        break;
                    default:
                        AudioPlayer.stop({ audioId: audioId.value });
                        break;
                }
            },
        );

        

        AudioPlayer.onMetadataUpdate({ audioId: audioId.value }, (result) => {
            console.log(result);
        });

        await AudioPlayer.initialize({ audioId: audioId.value }).catch((ex) =>
            console.log(ex.message),
        );
    }

    const addPlaylist = (
        name: string,
        image: string | undefined,
        trackPaths: string[],
    ) => {
        playlists.value.push({
            id: Date.now().toString(),
            name,
            image,
            trackPaths,
        });
        savePlaylists();
    };

    const loadPlaylists = async () => {
        const { value } = await Preferences.get({ key: "playlists" });
        if (value) playlists.value = JSON.parse(value);
    };

    const savePlaylists = async () => {
        await Preferences.set({
            key: "playlists",
            value: JSON.stringify(playlists.value),
        });
    };

    const getTracksFromPlaylist = (playlistId: string) => {
        const playlist = playlists.value.find((p) => p.id === playlistId);
        return playlist?.trackPaths
            .map((path) => files.value.find((f) => f.path === path))
            .filter(Boolean) as MusicFile[];
    };

    const loadMusicFromDirectories = async () => {
        try {
            console.log("Start loadMusicFromDirectories()");
            const { value } = await Preferences.get({ key: "directories" });
            console.log(
                `mainStore.ts:loadMusicFromDirectories:value - ${value}`,
            );
            if (!value) return;

            const dirs: string[] = JSON.parse(value);
            const allFiles: MusicFile[] = [];

            for (const dir of dirs) {
                try {
                    const result = await Filesystem.readdir({
                        path: dir,
                        directory: undefined,
                    });

                    const mp3Files = result.files
                        .filter((f) =>
                            typesOfFormats.includes(
                                f.name
                                    .split(".")
                                    [
                                        f.name.split(".").length - 1
                                    ].toLowerCase(),
                            ),
                        )
                        .map((f) => ({
                            name: f.name,
                            title: "",
                            author: "",
                            base64: "",
                            imageUrl: "",
                            isImageLoaded: false,
                            path: `${dir}/${f.name}`,
                        }));
                    allFiles.push(...mp3Files);
                } catch (e) {
                    console.log("Ошибка при чтении директории", dir, e);
                }
            }

            console.log("DELETING DUBS");

            // Убираем дубликаты
            const uniqueFilesMap = new Map<string, MusicFile>();
            allFiles.forEach((file) => {
                const key = file.path ?? file.name;
                if (!uniqueFilesMap.has(key)) {
                    uniqueFilesMap.set(key, file);
                }
            });

            files.value = Array.from(uniqueFilesMap.values());

            // Загружаем только метаданные в фоне
            console.log("LOAD METADATA");
            for (const file of files.value) {
                await loadMetadataWithCache(file);
            }

            console.log("END loadMusicFromDirectories()");
            console.log("FILES:", files.value);
        } catch (e) {
            console.error("Ошибка при загрузке директорий:", e);
        }
    };

    const loadMetadataWithCache = async (file: MusicFile) => {
        const cacheKey = `meta:${file.name}`;
        const fileFormat = file.name
            .split(".")
            [file.name.split(".").length - 1].toLowerCase();
        try {
            const cache = await Preferences.get({ key: cacheKey });
            if (cache.value) {
                const meta = JSON.parse(cache.value);
                file.title = meta.title;
                file.author = meta.author;
                file.imageUrl = meta.imageUrl;
                file.isImageLoaded = !!meta.imageUrl;
                console.log(imageUrl.value, meta.imageUrl);
                return;
            }

            // Загружаем base64 только если нужно
            const content = await Filesystem.readFile({
                path: "file://" + file.path,
                directory: undefined,
            });

            file.base64 = `data:audio/${fileFormat};base64,${content.data}`;
            const blob = await fetch(file.base64).then((res) => res.blob());
            const fileObj = new File([blob], file.name, {
                type: `audio/${fileFormat}`,
            });

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
            file.base64 = "";
        } catch (e) {
            console.warn("Ошибка метаданных:", file.name, e);
            file.title = file.name.replace(`.${fileFormat}`, "");
            file.author = "Неизвестный автор";
            file.imageUrl = "";
        }
    };
    const getCurrentPlaylistFiles = computed(() => {
        if (!currentPlaylist.value) return files.value;
        return currentPlaylist.value.trackPaths
            .map((p) => files.value.find((f) => f.path === p))
            .filter(Boolean) as MusicFile[];
    });

    const currentIndex = computed(() =>
        getCurrentPlaylistFiles.value.findIndex(
            (f) => f.name === currentFile.value?.name,
        ),
    );

    const nextTrack = async () => {
        const playlistFiles = getCurrentPlaylistFiles.value;
        if (!playlistFiles.length) return;

        const currentIdx = currentIndex.value;
        const nextIdx = (currentIdx + 1) % playlistFiles.length;

        if (isInitialized.value) {
            await stop();
        }
        
        _changeCurrentFile(playlistFiles[nextIdx]);
        

        if (!isInitialized.value) {
            await initialize(playlistFiles[nextIdx].path, playlistFiles[nextIdx].name, playlistFiles[nextIdx].title, playlistFiles[nextIdx].author);
        }

        await AudioPlayer.play({ audioId: audioId.value });
        isPlaying.value = true;

        startTimeUpdate();
    };

    const prevTrack = async () => {
        const playlistFiles = getCurrentPlaylistFiles.value;
        if (!playlistFiles.length) return;

        const currentIdx = currentIndex.value;
        const prevIdx =
            (currentIdx - 1 + playlistFiles.length) % playlistFiles.length;

        if (isInitialized.value) {
            await stop();
        }

        _changeCurrentFile(playlistFiles[prevIdx]);

        if (!isInitialized.value) {
            await initialize(playlistFiles[prevIdx].path, playlistFiles[prevIdx].name, playlistFiles[prevIdx].title, playlistFiles[prevIdx].author);
        }
        

        await AudioPlayer.play({ audioId: audioId.value });
        isPlaying.value = true;

        startTimeUpdate();
    };

    const removeTrackFromPlaylist = (playlistId: string, trackPath: string) => {
        const playlist = playlists.value.find((p) => p.id === playlistId);
        if (playlist) {
            playlist.trackPaths = playlist.trackPaths.filter(
                (p) => p !== trackPath,
            );
            savePlaylists();
        }
    };

    const addTrackToPlaylist = (playlistId: string, trackPath: string) => {
        const playlist = playlists.value.find((p) => p.id === playlistId);
        if (playlist && !playlist.trackPaths.includes(trackPath)) {
            playlist.trackPaths.push(trackPath);
            savePlaylists();
        }
    };

    const play = async (file: MusicFile) => {
        if (isInitialized.value) {
            await stop();
        }

        _changeCurrentFile(file);

        if (!isInitialized.value) {
            await initialize(file.path, file.name, file.title, file.author);
        }

        await AudioPlayer.play({ audioId: audioId.value });
        isPlaying.value = true;

        startTimeUpdate();

        isPlaying.value = true;
    };

    const stop = async () => {
        isInitialized.value = false;
        stopTimeUpdate();
        await AudioPlayer.destroy({ audioId: audioId.value }).catch((e) => {
            console.log(e.message);
        });
    };

    const startTimeUpdate = () => {
        stopTimeUpdate();

        currentPositionIntervalId = globalThis.setInterval(async () => {
            if (isPlaying.value) {
                let curTime = (
                    await AudioPlayer.getCurrentTime({ audioId: audioId.value })
                ).currentTime;
                let dur = (
                    await AudioPlayer.getDuration({ audioId: audioId.value })
                ).duration;
                progress.value = (curTime / dur) * 100;
                duration.value = `${String(Math.floor(curTime / 60)).padStart(2, "0")}:${String(Math.floor(curTime % 60)).padStart(2, "0")}/${String(Math.floor(dur / 60)).padStart(2, "0")}:${String(Math.floor(dur % 60)).padStart(2, "0")}`;
            }
        }, 1000);
    };

    const stopTimeUpdate = () => {
        clearInterval(currentPositionIntervalId);
        currentPositionIntervalId = 0;

        progress.value = 0;
        duration.value = "--/--";
    };

    const togglePlay = async () => {
        if (isPlaying.value) {
            await AudioPlayer.pause({ audioId: audioId.value });
            isPlaying.value = false;
        } else {
            await AudioPlayer.play({ audioId: audioId.value });
            isPlaying.value = true;
        }
    };

    const updateProgress = async (event: any) => {
        isPlaying.value = false;
        const curPercent = event.target.value;
        let dur = (await AudioPlayer.getDuration({ audioId: audioId.value }))
            .duration;
        AudioPlayer.seek({
            audioId: audioId.value,
            timeInSeconds: Math.ceil((curPercent * dur) / 100),
        });
        isPlaying.value = true;
    };

    loadPlaylists();

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
        addTrackToPlaylist,
    };
});
