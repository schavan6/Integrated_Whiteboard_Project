import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react';

const appId = '946c22c4770d470ca528d9e3e8c26205';
const token =
  '007eJxTYPixLf8328zpc3h8meZ92ewUJNZupJagxjY5aElr5kMF1xYFBksTs2Qjo2QTc3ODFBNzg+REUyOLFMtU41SLZCMzIwPTvZEByQ2BjAxXbkkwMzJAIIjPzJCcYcLAAACY0hyS';

export const config = { mode: 'rtc', codec: 'vp8', appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = 'ch4';
