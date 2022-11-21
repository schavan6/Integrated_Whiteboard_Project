import { createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react';

const appId = '946c22c4770d470ca528d9e3e8c26205';
const token =
  '007eJxTYKitsJMV6l0QtK/VPmOnhtphnWLdxek5it9MLT/wnPSfka/AYGlilmxklGxibm6QYmJukJxoamSRYplqnGqRbGRmZGB66Ex1ckMgI4Oq8W0GRigE8TkYkjMS8/JSc4wYGAD4Lh5H';

export const config = { mode: 'rtc', codec: 'vp8', appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = 'channel2';
