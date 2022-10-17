import { AgoraVideoPlayer } from 'agora-rtc-react';
import { Grid } from '@material-ui/core';
import { useState, useEffect } from 'react';
import './index.css';

export default function Video(props) {
  const {
    users,
    tracks,
    userMap,
    user,
    screenShareId,
    setScreenShareId,
    setShareId,
    setShareName,
    setScreenShareName,
    socket
  } = props;
  const [gridSpacing, setGridSpacing] = useState(12);

  const onNameClick = (userId, userName) => {
    console.log('clciked' + userId);
    setShareId(userId);
    if (userName === user.name) {
      setShareName('Me');
    } else {
      setShareName(userName);
    }

    socket.emit('requestBoard', {
      id: userId,
      uid: user.userId,
      roomId: user.roomId
    });
  };

  const shareScreen = (isAnonymous, userId, userName) => {
    setScreenShareId(userId);
    setScreenShareName(userName);
  };

  const stopSharing = () => {
    setScreenShareId('');
    setScreenShareName('');
  };

  return (
    <Grid container style={{ height: '100%' }}>
      <div>
        <Grid item xs={gridSpacing}>
          <AgoraVideoPlayer
            videoTrack={tracks[1]}
            style={{ height: '100%', width: '100%' }}
          />
        </Grid>
        <p
          className="my-2 w-100"
          onClick={() => onNameClick(user.userId, user.name)}
        >
          You
        </p>
      </div>
      <br />
      {users.length > 0 &&
        users.map((usr, index) => {
          if (usr.videoTrack) {
            return (
              <div key={usr.uid}>
                <Grid item xs={gridSpacing}>
                  <AgoraVideoPlayer
                    videoTrack={usr.videoTrack}
                    key={usr.uid}
                    style={{
                      height: '100%',
                      width: '100%',
                      position: 'relative'
                    }}
                  />
                </Grid>
                <div>
                  <p
                    key={index * 999}
                    className="my-2 "
                    onClick={() => onNameClick(usr.uid, userMap[usr.uid].name)}
                    style={{
                      float: 'left',
                      width: '50%'
                    }}
                  >
                    {userMap[usr.uid].name}{' '}
                    {user && user.userId === usr.uid && '(You)'}
                  </p>

                  {user?.presenter && (
                    <div className="dropdown">
                      <button
                        className="btn btn-secondary dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="fas fa-user"></i>
                      </button>
                      <ul className="dropdown-menu">
                        {screenShareId === '' && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                shareScreen(
                                  true,
                                  usr.userId,
                                  userMap[usr.uid].name
                                );
                              }}
                            >
                              Share
                            </button>
                          </li>
                        )}
                        {screenShareId === '' && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                shareScreen(
                                  false,
                                  usr.userId,
                                  userMap[usr.uid].name
                                );
                              }}
                            >
                              Share Privately
                            </button>
                          </li>
                        )}
                        {screenShareId !== '' && (
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                stopSharing(usr.userId, userMap[usr.uid].name);
                              }}
                            >
                              Stop Sharing
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <br />
              </div>
            );
          } else return null;
        })}
    </Grid>
  );
}
