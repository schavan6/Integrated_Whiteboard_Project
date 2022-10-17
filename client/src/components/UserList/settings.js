import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react';

const appId = '946c22c4770d470ca528d9e3e8c26205';
const token =
  '007eJxTYDCUuP49u9OH9w/HQ58XNX0pf5taPB9utv7nsPV358tPtzIUGCxNzJKNjJJNzM0NUkzMDZITTY0sUixTjVMtko3MjAxMLeu9kxsCGRmiWVSZGRkgEMRnZkjOMGRgAADC0R+k';

export const config = { mode: 'rtc', codec: 'vp8', appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = 'ch1';
