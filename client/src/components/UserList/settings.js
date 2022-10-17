import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react';

const appId = '946c22c4770d470ca528d9e3e8c26205';
const token =
  '007eJxTYKg1blhuc/711e4LGq5B06Z9q6u8U/tPW+n7hCWKq/ZzFOsqMFiamCUbGSWbmJsbpJiYGyQnmhpZpFimGqdaJBuZGRmYXrzqk9wYyMhgM28CEyMDBIL4zAzJGUYMDACJLh+3';

export const config = { mode: 'rtc', codec: 'vp8', appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = 'ch2';
