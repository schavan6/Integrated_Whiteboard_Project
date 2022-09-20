import './index.css';
import { useState, useRef, useEffect } from 'react';
import WhiteBoard from '../../components/Whiteboard';
import ShareBoard from '../../components/ShareBoard';
import GroupBoard from '../../components/GroupBoard';
import CreateGroupModal from '../../components/CreateGroupModal';

import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const RoomPage = ({ user, socket, users }) => {
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('black');
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const sharedCanvasRef = useRef(null);
  const sharedCtxRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [sharedElements, setSharedElements] = useState([]);
  const [groupElements, setGroupElements] = useState([]);
  const [openedUserTab, setOpenedUserTab] = useState(false);
  const [shareId, setShareId] = useState(null);
  const [shareName, setShareName] = useState('Instructor');
  const [openModal, setOpenModal] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [isShareActive, setShareActive] = useState(
    user?.presenter ? false : true
  );
  const [isGroupActive, setGroupActive] = useState(false);
  const [screenShareId, setScreenShareId] = useState('');
  const [screenShareName, setScreenShareName] = useState('');

  useEffect(() => {
    socket.on('joinGroup', (data) => {
      if (data.members.includes(user.userId)) {
        alert("You are added to group '" + data.groupName + "'.");
        setGroupId(data.groupId);
        user.groupId = data.groupId;
      }
    });
  }, []);

  useEffect(() => {
    if (shareId != null && shareId === groupId) {
      setGroupActive(true);
      setShareActive(false);
    } else if (shareId != null && shareId === user.userId) {
      setGroupActive(false);
      setShareActive(false);
    } else {
      setGroupActive(false);
      setShareActive(true);
    }
  }, [shareId]);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillRect = 'white';
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setElements([]);
  };

  const showWhiteBoard = () => {
    const shareWhiteBoard =
      (shareId === null && user?.presenter) || user.userId == shareId;
    return shareWhiteBoard;
  };

  const sendGroupCreationEvent = (usersAdded, name) => {
    setOpenModal(false);
    const newUserId = uuid();
    const roomData = {
      name: name,
      roomId: user.roomId,
      userId: newUserId,
      host: false,
      presenter: false,
      hostId: user.userId
    };
    socket.emit('userJoined', roomData);
    const data = {
      members: usersAdded,
      groupId: newUserId,
      roomId: user.roomId,
      groupName: name
    };
    socket.emit('createGroup', data);
  };

  const uuid = () => {
    let S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      S4() +
      S4()
    );
  };

  const closeModal = () => {
    setOpenModal(false);
  };

  const onNameClick = (userId, userName) => {
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

  const canOpenModal = () => {
    return user?.presenter && openModal;
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
    <div className="row">
      <button
        type="button"
        className="btn btn-dark"
        style={{
          display: 'block',
          position: 'absolute',
          top: '10%',
          left: '5%',
          height: '40px',
          width: '120px'
        }}
        onClick={() => setOpenedUserTab(true)}
      >
        Participants
      </button>
      {openedUserTab && (
        <div
          className="position-fixed top-0 h-100 text-white bg-dark"
          style={{ width: '250px', left: '0%', zIndex: 999 }}
        >
          <button
            type="button"
            onClick={() => setOpenedUserTab(false)}
            className="btn btn-light btn-block w-100 mt-5"
          >
            Close
          </button>
          <div className="w-100 mt-5 pt-5">
            {users.map((usr, index) => (
              <div>
                <p
                  key={index * 999}
                  className="my-2 text-center w-100"
                  onClick={() => onNameClick(usr.userId, usr.name)}
                >
                  {usr.name} {user && user.userId === usr.userId && '(You)'}
                </p>

                {user?.presenter && (
                  <div className="dropdown" style={{ textAlign: 'center' }}>
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
                              shareScreen(true, usr.userId, usr.name);
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
                              shareScreen(false, usr.userId, usr.name);
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
                              stopSharing(usr.userId, usr.name);
                            }}
                          >
                            Stop Sharing
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                <br />
              </div>
            ))}
          </div>
        </div>
      )}
      <h4 className="text-center py-4">{shareName} : </h4>
      <div className="col-mid-10 mx-auto px-5 d-flex align-items-center justify-content-center">
        {(user?.presenter || !isShareActive) && (
          <FormControl>
            <RadioGroup
              aria-labelledby="demo-controlled-radio-buttons-group"
              name="controlled-radio-buttons-group"
              onChange={(e) => setTool(e.target.value)}
              row={true}
            >
              <FormControlLabel
                value="pencil"
                control={<Radio />}
                label="Pencil"
              />
              <FormControlLabel value="line" control={<Radio />} label="Line" />
            </RadioGroup>
          </FormControl>
        )}

        {(user?.presenter || !isShareActive) && (
          <div className="col-md-5">
            <div className="d-flex align-items-center justify-content-center">
              <label htmlFor="color">Select Color: </label>
              <input
                type="color"
                id="color"
                value="{color}"
                style={{ width: '100px' }}
                className="mt-1 ms-3"
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
        )}
        {(user?.presenter || !isShareActive) && (
          <div className="col-md-2">
            <button className="btn btn-danger" onClick={handleClearCanvas}>
              Clear Board
            </button>
          </div>
        )}

        {user?.presenter && users.length > 1 && (
          <div className="col-md-2">
            <button
              className="btn btn-primary"
              onClick={() => setOpenModal(true)}
            >
              Create Group
            </button>
          </div>
        )}
      </div>
      {showWhiteBoard() ? (
        <WhiteBoard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          elements={elements}
          setElements={setElements}
          tool={tool}
          color={color}
          user={user}
          socket={socket}
          screenShareId={screenShareId}
          screenShareName={screenShareName}
        />
      ) : shareId != null && shareId === groupId ? (
        <GroupBoard
          canvasRef={sharedCanvasRef}
          ctxRef={sharedCtxRef}
          elements={groupElements}
          setElements={setGroupElements}
          tool={tool}
          color={color}
          user={user}
          socket={socket}
          shareName={shareName}
        />
      ) : (
        <ShareBoard
          canvasRef={sharedCanvasRef}
          ctxRef={sharedCtxRef}
          elements={sharedElements}
          setElements={setSharedElements}
          tool={tool}
          color={color}
          user={user}
          socket={socket}
          shareId={shareId}
          shareName={shareName}
        />
      )}
      {canOpenModal() && (
        <CreateGroupModal
          sendGroupCreationEvent={sendGroupCreationEvent}
          closeModal={closeModal}
          users={users}
          user={user}
        />
      )}
    </div>
  );
};

export default RoomPage;
