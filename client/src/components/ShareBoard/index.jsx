import { useEffect, useState } from "react";
import { Box } from '@mui/material';

const ShareBoard = ({user, socket, shareId}) => {
    const [imageMap, setImageMap] = useState(null);
    useEffect(() => {
        socket.on("whiteBoardDataResponse", (data) => {
            setImageMap(new Map(data.imgMap));
        });
    }, []);
    if(!user?.presenter && imageMap != null){
        return(
            <Box className="border border-dark border-3 overflow-hidden" sx={{maxHeight: '700px'}}>
                <img
                    src={imageMap.get(user.hostId)}
                    alt="Real time whiteboard sharing"
                />
            </Box>
        );
    }
    else if(user?.presenter && shareId != null){

        return(
            <Box className="border border-dark border-3 overflow-hidden" sx={{maxHeight: '700px'}}>
                <img
                    src={imageMap.get(shareId)}
                    alt="Real time whiteboard sharing"
                />
            </Box>
        );
    }
    else{
        return null
    }
    }

    export default ShareBoard