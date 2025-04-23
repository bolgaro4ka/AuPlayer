import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'directories';

export async function getDirectories(): Promise<string[]> {
  const res = await Preferences.get({ key: STORAGE_KEY });
  return res.value ? JSON.parse(res.value) : [];
}

export async function saveDirectories(dirs: string[]) {
  await Preferences.set({
    key: STORAGE_KEY,
    value: JSON.stringify(dirs),
  });
}
