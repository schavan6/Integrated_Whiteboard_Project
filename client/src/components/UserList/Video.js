import { AgoraVideoPlayer } from 'agora-rtc-react';
import { Grid } from '@material-ui/core';
import { useState, useEffect } from 'react';
import './index.css';

export default function Video(props) {
  const { users, tracks } = props;
  const [gridSpacing, setGridSpacing] = useState(12);

  useEffect(() => {
    setGridSpacing(Math.max(Math.floor(12 / (users.length + 1)), 4));
    console.log(users);
  }, [users, tracks]);

  return (
    <Grid container style={{ height: '100%' }}>
      <div>
        <Grid item xs={gridSpacing}>
          <AgoraVideoPlayer
            videoTrack={tracks[1]}
            style={{ height: '100%', width: '100%' }}
          />
        </Grid>
        <p>You</p>
      </div>
      <br />
      {users.length > 0 &&
        users.map((user) => {
          if (user.videoTrack) {
            return (
              <div>
                <Grid item xs={gridSpacing}>
                  <AgoraVideoPlayer
                    videoTrack={user.videoTrack}
                    key={user.uid}
                    style={{
                      height: '100%',
                      width: '100%',
                      position: 'relative'
                    }}
                  />
                </Grid>
                <p>{user.uid}</p>
                <br />
              </div>
            );
          } else return null;
        })}
    </Grid>
  );
}
