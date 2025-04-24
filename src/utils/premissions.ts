// import { Permissions } from '@capacitor/permissions';

// export async function requestStoragePermission(): Promise<boolean> {
//   const { Storage } = await import('@capacitor/storage');

//   const status = await Permissions.query({ name: 'filesystem' });
//   if (status.state === 'granted') return true;

//   const result = await Permissions.request({ name: 'filesystem' });
//   return result.state === 'granted';
// }
