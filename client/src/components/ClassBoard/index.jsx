import { useEffect, useState, useLayoutEffect } from 'react';
import rough from 'roughjs/bundled/rough.cjs';
import { Box } from '@mui/material';

const roughGenerator = rough.generator();

const ClassBoard = ({
  user,
  socket,
  setShareBoardName
}) => {
  const [imageMap, setImageMap] = useState(null);
  const [shareId, setShareId] = useState(null);

  if(shareId == null){
    socket.emit('getShareId', user.roomId);
  }
  if(imageMap == null){
    socket.emit('getWhiteBoardData', user.roomId);
  }

  useEffect(() => {
    socket.on('whiteBoardDataResponse', (data) => {
      setImageMap(new Map(data.imgMap));
    });
  }, []);

  useEffect(() => {
    socket.on('shareIdResponse', (data) => {
      setShareId(data.userId);
      setShareBoardName(data.userName);
    });
  }, []);

  return (

    <Box
      component="img"
      className="border border-dark border-3 overflow-hidden"
      sx={{ maxHeight: '700px' }}
      src={(shareId !== null && imageMap !== null) ? imageMap.get(shareId) : null}
      alt="class board"
    />
  );
};

export default ClassBoard;
