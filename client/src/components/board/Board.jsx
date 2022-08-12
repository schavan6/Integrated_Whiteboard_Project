import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './style.css';

const Board = ({ auth, sentProps }) => {
  var timeout,
    //ctx,
    isDrawing = false;

  const [hasInput, setHasInput] = React.useState(false);

  const [isEmitting, setIsEmitting] = useState(false);

  const [canvasState, setCanvasState] = useState('');

  const [otherCanvasState, setOtherCanvasState] = useState('');

  useEffect(() => {
    drawOnCanvas();
    sentProps.socket.on('get-canvas-data', function (data) {
      if (data === 'instructor') {
        if (auth.user && auth.user.role === 'Instructor') {
          var canvas = document.querySelector('#board');
          var base64ImageData = canvas.toDataURL('image/png');
          sentProps.socket.emit('canvas-data', base64ImageData);
        }
      }
    });
  }, [isEmitting, auth.user]);

  useEffect(() => {
    if (sentProps.connectToInstructor === true) {
      var canvas = document.querySelector('#board');
      var base64ImageData = canvas.toDataURL('image/png');
      setCanvasState(base64ImageData);
      sentProps.socket.emit('get-canvas-data', 'instructor');
    } else {
      reloadCanvas();
    }
    sentProps.socket.on('canvas-data', function (data) {
      if (auth.user) {
        if (auth.user.role === 'Instructor') {
          var interval = setInterval(function () {
            if (isDrawing) return;
            isDrawing = true;
            clearInterval(interval);
            setCanvasState(data);
          }, 50);
        } else if (auth.user.role === 'Student') {
          var interval = setInterval(function () {
            if (isDrawing) return;
            isDrawing = true;
            clearInterval(interval);
            if (sentProps.connectToInstructor === true) {
              setOtherCanvasState(data);
            }
          }, 50);
        }
      }
    });
  }, [sentProps.connectToInstructor]);

  useEffect(() => {
    sentProps.socket.on('connect-student', function (data) {
      if (sentProps.user_id === data) {
        setIsEmitting(true);
      }
    });
  }, [sentProps.user_id]);

  useEffect(() => {
    reloadCanvas();
  }, [otherCanvasState, sentProps.color, sentProps.size]);

  useEffect(() => {
    drawOnCanvas();
  }, [sentProps.color, sentProps.size]);

  const reloadCanvas = () => {
    var image = new Image();
    var canvas = document.querySelector('#board');
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = sentProps.color;
    ctx.lineWidth = sentProps.size;
    image.onload = function () {
      ctx.drawImage(image, 0, 0);

      isDrawing = false;
    };
    if (sentProps.connectToInstructor) {
      image.src = otherCanvasState;
    } else {
      image.src = canvasState;
    }
  };

  const drawOnCanvas = () => {
    var canvas = document.querySelector('#board');
    var ctx = canvas.getContext('2d');
    ctx.strokeStyle = sentProps.color;
    ctx.lineWidth = sentProps.size;

    var sketch = document.querySelector('#sketch');
    var sketch_style = getComputedStyle(sketch);
    canvas.width = parseInt(sketch_style.getPropertyValue('width'));
    canvas.height = parseInt(sketch_style.getPropertyValue('height'));

    var mouse = { x: 0, y: 0 };
    var last_mouse = { x: 0, y: 0 };

    /* Mouse Capturing Work */
    canvas.addEventListener(
      'mousemove',
      function (e) {
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;

        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
      },
      false
    );

    /* Drawing on Paint App */
    ctx.lineWidth = sentProps.size;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = sentProps.color;

    canvas.addEventListener(
      'mousedown',
      function (e) {
        canvas.addEventListener('mousemove', onPaint, false);
      },
      false
    );

    canvas.addEventListener(
      'mouseup',
      function () {
        canvas.removeEventListener('mousemove', onPaint, false);
      },
      false
    );

    var onPaint = function () {
      ctx.beginPath();
      ctx.moveTo(last_mouse.x, last_mouse.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.closePath();
      ctx.stroke();

      if (timeout !== undefined) clearTimeout(timeout);
      if ((auth.user && auth.user.role === 'Instructor') || isEmitting) {
        timeout = setTimeout(function () {
          var base64ImageData = canvas.toDataURL('image/png');
          sentProps.socket.emit('canvas-data', base64ImageData);
        }, 50);
      }
    };

    //Key handler for input box:
    var handleEnter = function (e) {
      var keyCode = e.keyCode;
      if (keyCode === 13) {
        drawText(
          this.value,
          parseInt(this.style.left, 10),
          parseInt(this.style.top, 10)
        );

        document.body.removeChild(this);
        setHasInput(false);

        var base64ImageData = canvas.toDataURL('image/png');
        if ((auth.user && auth.user.role === 'Instructor') || isEmitting) {
          sentProps.socket.emit('canvas-data', base64ImageData);
        }
      }
    };

    //Draw the text onto canvas:
    var drawText = function (txt, x, y) {
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.font = '14px sans-serif';
      ctx.fillText(txt, x - 4, y - 4);
    };

    var addInput = function (x, y) {
      var input = document.createElement('textarea');

      //input.type = "text";
      input.style.position = 'fixed';
      input.style.left = x - 4 + 'px';
      input.style.top = y - 4 + 'px';

      input.onkeydown = handleEnter;

      document.body.appendChild(input);

      input.focus();
      setHasInput(true);
    };

    canvas.addEventListener(
      'dblclick',
      function (e) {
        e.preventDefault();
        if (!hasInput) addInput(e.clientX, e.clientY);
      },
      false
    );
  };

  return (
    <div className="sketch" id="sketch">
      <canvas className="board" id="board"></canvas>
    </div>
  );
};

Board.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  auth: state.auth,
  sentProps: ownProps
});

export default connect(mapStateToProps, undefined)(Board);
