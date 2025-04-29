
export interface MusicFile {
  name: string;
  title: string;
  author: string;
  base64: string;
  imageUrl: string;
  isImageLoaded: boolean;
  path?: string; // <-- добавлено
}
