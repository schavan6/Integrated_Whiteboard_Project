import { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import './index.css';

import WhiteBoard from '../../components/Whiteboard';

const RoomPage = ({ auth, user, socket, users }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('black');
  const [elements, setElements] = useState([]);
  const [otherElements, setOtherElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [openedUserTab, setOpenedUserTab] = useState(false);
  const [connectToSelf, setConnectToSelf] = useState(true);

  useEffect(() => {
    if (auth.user && auth.user.role === 'Student') {
      setConnectToSelf(false);
    }
  }, []);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillRect = 'white';
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setElements([]);
  };

  const undo = () => {
    setHistory((prevHistory) => [
      ...prevHistory,
      elements[elements.length - 1]
    ]);
    setElements((prevElements) =>
      prevElements.slice(0, prevElements.length - 1)
    );
  };

  const redo = () => {
    setElements((prevElements) => [
      ...prevElements,
      history[history.length - 1]
    ]);
    setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
  };

  const onItemClick = (key, socketId) => {
    if (key == 'me') {
      setConnectToSelf(true);
    } else {
      if (user.userId === key) {
        setConnectToSelf(true);
      } else {
        setConnectToSelf(false);
        socket.emit('connect-to-student', socketId);
      }
    }
  };

  return (
    <div className="row">
      <div className="row">
        <div className="col-md-4">
          <button
            type="button"
            className="btn btn-primary"
            style={{
              display: 'block',
              position: 'absolute',

              height: '40px',
              width: '100px'
            }}
            onClick={() => setOpenedUserTab(true)}
          >
            Users
          </button>
        </div>

        <span className="text-primary text-center py-4 col-md-4">
          [Users Online : {users.length}]
        </span>
      </div>
      {openedUserTab && (
        <div
          className="position-fixed top-0 h-100 text-white bg-dark"
          style={{ width: '250px', left: '0%' }}
        >
          <button
            type="button"
            onClick={() => setOpenedUserTab(false)}
            className="btn btn-primary btn-block w-100 mt-5"
          >
            Close
          </button>
          {auth.user.role === 'Instructor' ? (
            <div className="w-100 mt-5 pt-5">
              {users.map((usr, index) => (
                <button
                  type="button"
                  key={usr.socketId}
                  id={usr.socketId}
                  className="btn btn-light btn-block w-100 mt-5"
                  onClick={() => onItemClick(usr.userId, usr.socketId)}
                >
                  {' '}
                  <span>
                    {usr.name +
                      ' ' +
                      (user && user.userId === usr.userId ? '(You)' : '')}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="w-100 mt-5 pt-5">
              <button
                type="button"
                key="instructor"
                id="instructor"
                className="btn btn-light btn-block w-100 mt-5"
                onClick={() => onItemClick('instructor', 'me')}
              >
                Instructor
              </button>
              <button
                type="button"
                key="me"
                id="me"
                className="btn btn-light btn-block w-100 mt-5"
                onClick={() => onItemClick('me', 'me')}
              >
                Me
              </button>
            </div>
          )}
        </div>
      )}

      {user?.presenter && (
        <div className="row">
          <div className="mx-5 col-md-3">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="tool"
                id="pencil"
                value="pencil"
                checked={tool === 'pencil'}
                onChange={(e) => setTool(e.target.value)}
              />
              <label className="form-check-label" htmlFor="pencil">
                Pencil
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="tool"
                id="line"
                value="line"
                checked={tool === 'line'}
                onChange={(e) => setTool(e.target.value)}
              />
              <label className="form-check-label" htmlFor="line">
                Line
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="tool"
                id="rectangle"
                value="rectangle"
                checked={tool === 'rectangle'}
                onChange={(e) => setTool(e.target.value)}
              />
              <label className="form-check-label" htmlFor="rectangle">
                Rectangle
              </label>
            </div>
          </div>
          <div className="mx-5 col-md-2 justify-content-center">
            <div className="d-flex align-items-center justify-content-center">
              <label htmlFor="color">Select Color: </label>
              <input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3 d-flex gap-2">
            <button
              className="btn btn-primary mt-1"
              disabled={elements.length === 0}
              onClick={() => undo()}
            >
              Undo
            </button>
            <button
              className="btn btn-outline-primary mt-1"
              disabled={history.length < 1}
              onClick={() => redo()}
            >
              Redo
            </button>
          </div>
          <div className="col-md-2">
            <button className="btn btn-danger" onClick={handleClearCanvas}>
              Clear Canvas
            </button>
          </div>
        </div>
      )}
      <div className="col-md-10 mx-auto mt-4 canvas-box">
        <WhiteBoard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          elements={elements}
          setElements={setElements}
          otherElements={otherElements}
          setOtherElements={setOtherElements}
          color={color}
          tool={tool}
          user={user}
          socket={socket}
          connectToSelf={connectToSelf}
        />
      </div>
    </div>
  );
};

RoomPage.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(RoomPage);
