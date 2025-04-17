import { parseBlob } from 'music-metadata';

const fadeOutAndStop = async (audio: HTMLAudioElement, duration = 500) => {
    return new Promise<void>((resolve) => {
      const steps = 20;
      const interval = duration / steps;
      let currentStep = 0;
  
      const originalVolume = audio.volume;
  
      const fade = setInterval(() => {
        currentStep++;
        const volume = originalVolume * (1 - currentStep / steps);
        audio.volume = Math.max(volume, 0);
  
        if (currentStep >= steps) {
          clearInterval(fade);
          audio.pause();
          audio.currentTime = 0;
          audio.volume = originalVolume; // вернуть громкость на будущее
          resolve();
        }
      }, interval);
    });
  };




  async function extractMetadata(file: File) {
    const metadata = await parseBlob(file);
    const { title, artist, picture } = metadata.common;
  
    let imageUrl = '';
    if (picture && picture.length > 0) {
      const blob = new Blob([picture[0].data], { type: picture[0].format });
      imageUrl = URL.createObjectURL(blob);
    }
  
    return {
      title: title || file.name.replace('.mp3', ''),
      artist: artist || 'Unknown Artist',
      imageUrl,
    };
  }
  
  
  export {fadeOutAndStop, extractMetadata}