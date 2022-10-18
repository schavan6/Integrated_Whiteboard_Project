import { useEffect, useState, useLayoutEffect } from 'react';
import rough from 'roughjs/bundled/rough.cjs';
import { Box } from '@mui/material';

const roughGenerator = rough.generator();

const WhiteBoard = ({
  canvasRef,
  ctxRef,
  elements,
  setElements,
  tool,
  color,
  user,
  socket,
  screenShareId,
  screenShareName
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageMap, setImageMap] = useState(null);
  const [selfImage, setSelfImage] = useState('');

  const listener = (data) => {
    setImageMap(new Map(data.imgMap));
  };

  useEffect(() => {
    socket.removeListener('whiteBoardDataResponse');
    socket.on('whiteBoardDataResponse', listener);
  }, []);

  useEffect(() => {
    socket.on('sharedWhiteBoardDataResponse', (data) => {
      if (user.userId == data.receiver) {
        drawImageOnCanvas(data.imgurl);
      }
    });
  }, []);

  useEffect(() => {
    if (ctxRef && ctxRef.current) {
      const canvasImage = canvasRef.current.toDataURL();
      setSelfImage(canvasImage);
      ctxRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
    if (screenShareId !== '') {
      setIsDrawing(false);

      if (imageMap !== null && imageMap.has(screenShareId)) {
        drawImageOnCanvas(imageMap.get(screenShareId));
      }
    } else {
      drawElements();
    }
  }, [screenShareId]);

  useLayoutEffect(() => {
    if (
      screenShareId !== '' &&
      imageMap !== null &&
      imageMap.has(screenShareId)
    ) {
      socket.emit('whiteboardData', {
        imgurl: imageMap.get(screenShareId),
        uid: user.userId,
        roomId: user.roomId
      });
    } else if (imageMap !== null && imageMap.has(user.userId)) {
      socket.emit('whiteboardData', {
        imgurl: selfImage,
        uid: user.userId,
        roomId: user.roomId
      });
    }
  }, [screenShareId]);
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (canvasRef) {
      drawElements();
      if (elements.length > 0) {
        const canvasImage = canvasRef.current.toDataURL();
        socket.emit('whiteboardData', {
          imgurl: canvasImage,
          uid: user.userId,
          roomId: user.roomId
        });
      }
    }
  }, [elements]);

  const drawElements = () => {
    if (canvasRef) {
      const roughCanvas = rough.canvas(canvasRef.current);

      elements.forEach((element) => {
        if (element.type == 'line') {
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
        } else if (element.type == 'pencil') {
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
    if (screenShareId === '') {
      const { offsetX, offsetY } = e.nativeEvent;
      if (tool == 'pencil') {
        setElements((prevElements) => [
          ...prevElements,
          {
            type: 'pencil',
            offsetX,
            offsetY,
            path: [[offsetX, offsetY]],
            stroke: color
          }
        ]);
      } else if (tool == 'line') {
        setElements((prevElements) => [
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
      }
      setIsDrawing(true);
    }
  };

  const drawImageOnCanvas = (url) => {
    if (ctxRef && ctxRef.current) {
      var image = new Image();

      image.onload = function () {
        ctxRef.current.drawImage(image, 0, 0);
      };
      image.src = url;
    }
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (isDrawing) {
      if (tool == 'pencil') {
        const { path } = elements[elements.length - 1];
        const newPath = [...path, [offsetX, offsetY]];

        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index == elements.length - 1) {
              return {
                ...ele,
                path: newPath
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool == 'line') {
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index == elements.length - 1) {
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
      }
    }
  };

  const handleMouseUp = (e) => {
    setIsDrawing(false);
  };
  return (
    <Box
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="border border-dark border-3 overflow-hidden"
      sx={{ maxHeight: '700px' }}
    >
      <canvas ref={canvasRef} />
    </Box>
  );
};

export default WhiteBoard;
