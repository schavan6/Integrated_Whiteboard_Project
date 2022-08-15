import { useEffect, useState, useLayoutEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import rough from 'roughjs/bundled/rough.cjs';

const roughGenerator = rough.generator();

const WhiteBoard = ({
  auth,
  canvasRef,
  ctxRef,
  elements,
  setElements,
  otherElements,
  setOtherElements,
  tool,
  color,
  user,
  socket,
  connectToSelf
}) => {
  const [img, setImg] = useState(null);
  const [isEmitting, setIsEmitting] = useState(false);
  const [receiver, setReceiver] = useState('all');

  useEffect(() => {
    socket.removeListener('whiteBoardDataResponse');
    socket.on('whiteBoardDataResponse', (data) => {
      if (auth.user.role === 'Student' || !connectToSelf) {
        setImg(data.imgURL);
      }

      if (
        (auth.user.role === 'Instructor' && !connectToSelf) ||
        (auth.user.role === 'Student' && connectToSelf)
      ) {
        console.log('TV Writing Data from event ', data.imgURL);
        drawImageOnCanvas(data.imgURL);
      }
    });

    socket.removeListener('connect-to-instructor');
    socket.on('connect-to-instructor', (data) => {
      setIsEmitting(true);
      if (canvasRef && canvasRef.current) {
        const canvasImage = canvasRef.current.toDataURL();
        socket.emit('whiteboardData', canvasImage);
      }
    });
  }, [connectToSelf]);

  const drawImageOnCanvas = (url) => {
    if (ctxRef && ctxRef.current) {
      var image = new Image();

      //console.log('TV Redraw Canvas ');
      image.onload = function () {
        console.log('TV Redraw Canvas onload ', image.src);
        ctxRef.current.drawImage(image, 0, 0);
      };
      image.src = url;
    }
  };

  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.height = window.innerHeight * 2;
      canvas.width = window.innerWidth * 2;
      const ctx = canvas.getContext('2d');

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      console.log('TV CTX InIt', ctx);
      ctxRef.current = ctx;
    }
  }, [canvasRef?.current]);

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.height = window.innerHeight * 2;
      canvas.width = window.innerWidth * 2;

      drawElements();

      if (auth.user.role === 'Instructor' && connectToSelf === false) {
        console.log('TV Writing Data from effect');
        drawImageOnCanvas(img);
      }
    }
  }, [connectToSelf]);

  useEffect(() => {
    if (ctxRef && ctxRef.current) {
      ctxRef.current.strokeStyle = color;
    }
  }, [color]);

  useLayoutEffect(() => {
    if (canvasRef && canvasRef.current) {
      drawElements();

      if ((auth.user && auth.user.role === 'Instructor') || isEmitting) {
        const canvasImage = canvasRef.current.toDataURL();
        const data = { receiver, img: canvasImage };
        console.log('TV Sending data ');
        socket.emit('whiteboardData', data);
      }
    }
  }, [elements, otherElements]);

  const drawElements = () => {
    if (canvasRef && canvasRef.current) {
      const roughCanvas = rough.canvas(canvasRef.current);

      let elementsToDraw = [];

      if (auth.user.role === 'Student' || connectToSelf === true) {
        elementsToDraw = elements;
      } else {
        elementsToDraw = otherElements;
      }

      if (ctxRef && ctxRef.current) {
        console.log('TV clearing canvas');
        ctxRef.current.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }

      if (auth.user.role === 'Instructor' && !connectToSelf) {
        console.log('TV Writing Data from drawElements ');
        drawImageOnCanvas(img);
      }

      elementsToDraw.forEach((element) => {
        if (element.type === 'rect') {
          roughCanvas.draw(
            roughGenerator.rectangle(
              element.offsetX,
              element.offsetY,
              element.width,
              element.height,
              {
                stroke: element.stroke,
                strokeWidth: 5,
                roughness: 0
              }
            )
          );
        } else if (element.type === 'line') {
          roughCanvas.draw(
            roughGenerator.line(
              element.offsetX,
              element.offsetY,
              element.width,
              element.height,
              {
                stroke: element.stroke,
                strokeWidth: 5,
                roughness: 0
              }
            )
          );
        } else if (element.type === 'pencil') {
          roughCanvas.linearPath(element.path, {
            stroke: element.stroke,
            strokeWidth: 5,
            roughness: 0
          });
        }
      });
    }
  };

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const setFunction =
      auth.user.role === 'Student' || connectToSelf === true
        ? setElements
        : setOtherElements;
    if (tool === 'pencil') {
      setFunction((prevElements) => [
        ...prevElements,
        {
          type: 'pencil',
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color
        }
      ]);
    } else if (tool === 'line') {
      setFunction((prevElements) => [
        ...prevElements,
        {
          type: 'line',
          offsetX,
          offsetY,
          width: offsetX,
          height: offsetY,
          stroke: color
        }
      ]);
    } else if (tool === 'rect') {
      setFunction((prevElements) => [
        ...prevElements,
        {
          type: 'rect',
          offsetX,
          offsetY,
          width: 0,
          height: 0,
          stroke: color
        }
      ]);
    }

    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    const setFunction =
      auth.user.role === 'Student' || connectToSelf === true
        ? setElements
        : setOtherElements;

    const elementArray =
      auth.user.role === 'Student' || connectToSelf === true
        ? elements
        : otherElements;

    if (isDrawing) {
      if (tool === 'pencil') {
        const { path } = elementArray[elementArray.length - 1];
        const newPath = [...path, [offsetX, offsetY]];
        setFunction((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elementArray.length - 1) {
              return {
                ...ele,
                path: newPath
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === 'line') {
        setFunction((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elementArray.length - 1) {
              return {
                ...ele,
                width: offsetX,
                height: offsetY
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === 'rect') {
        setFunction((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elementArray.length - 1) {
              return {
                ...ele,
                width: offsetX - ele.offsetX,
                height: offsetY - ele.offsetY
              };
            } else {
              return ele;
            }
          })
        );
      }
    }
  };

  const handleMouseUp = (e) => {
    setIsDrawing(false);
  };

  if (!connectToSelf && auth.user.role === 'Student') {
    return (
      <div className="border border-dark border-3 h-100 w-100 overflow-hidden">
        <img
          src={img}
          alt="Real time white board image shared by presenter"
          // className="w-100 h-100"
          style={{
            height: window.innerHeight * 2,
            width: '285%'
          }}
        />
      </div>
    );
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="border border-dark border-3 h-100 w-100 overflow-hidden"
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

WhiteBoard.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(WhiteBoard);
