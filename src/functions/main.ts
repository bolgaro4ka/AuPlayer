import type { MusicFile } from "@/composables/useMusicPlayer";
import { Directory, Filesystem } from "@capacitor/filesystem";
import type {
    AudioPlayerDefaultParams,
    AudioPlayerPlugin,
} from "@mediagrid/capacitor-native-audio";
import { parseBlob } from "music-metadata";

const fadeOutAndStop = async (
    audio: AudioPlayerPlugin,
    audioId: string,
    volume = 1,
    duration = 500,
) => {
    return new Promise<void>((resolve) => {
        const steps = 20;
        const interval = duration / steps;
        let currentStep = 0;

        const originalVolume = volume;

        const fade = setInterval(() => {
            currentStep++;
            const volume = originalVolume * (1 - currentStep / steps);
            audio.setVolume({ audioId: audioId, volume: Math.max(volume, 0) });

            if (currentStep >= steps) {
                clearInterval(fade);
                audio.pause({ audioId: audioId });
                audio.setVolume({ audioId: audioId, volume: originalVolume }); // вернуть громкость на будущее
                resolve();
            }
        }, interval);
    });
};

async function extractMetadata(file: File) {
    const metadata = await parseBlob(file);
    const { title, artist, picture } = metadata.common;

    let imageUrl = "";
    if (picture && picture.length > 0) {
        const pic = picture[0];

        const uint8Array = new Uint8Array(pic.data);
        let binary = "";
        const len = uint8Array.byteLength;

        for (let i = 0; i < len; i++) {
            binary += String.fromCodePoint(uint8Array[i]);
        }

        const base64 = btoa(binary);

        imageUrl = `data:${pic.format};base64,${base64}`;
    }

    console.log("EXTRACTING METADATA:", title, artist, imageUrl);

    return {
        title: title || file.name.replace(".mp3", ""),
        artist: artist || "Unknown Artist",
        imageUrl,
    };
}

const loadMetadata = async (file: MusicFile) => {
    try {
        if (!file.base64) {
            const content = await Filesystem.readFile({
                path: "file://" + file.path,
                directory: undefined,
            });

            file.base64 = `data:audio/mp3;base64,${content.data}`;
        }

        const blob = await fetch(file.base64).then((res) => res.blob());
        const fileObj = new File([blob], file.name, { type: "audio/mp3" });

        const meta = await extractMetadata(fileObj);

        file.title = meta.title;
        file.author = meta.artist;
        file.imageUrl = meta.imageUrl;
    } catch (e) {
        console.warn(`Ошибка при загрузке метаданных: ${file.name}`, e);
    }
};

function getCacheKey(fileName: string) {
    return `meta:${fileName}`;
}

export { fadeOutAndStop, extractMetadata, loadMetadata, getCacheKey };
