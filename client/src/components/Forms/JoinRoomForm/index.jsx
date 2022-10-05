import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import api from '../../../utils/api';
import { useSelector } from 'react-redux';
import {TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Button} from '@mui/material'

const JoinRoomForm = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState("");
  const user = useSelector((state) => state.auth.user);
  const [sessions, setSessions] = useState([
    {
        hostname: "",
        sessionname: "",
    }
]);

  useEffect(() => {
    fetch("/api/sessions")
    .then((res) => {
        if (res.ok){
            return res.json();
        }
    })
    .then((jsonRes) => setSessions(jsonRes.filter(s => s.isstarted === true && s.isended === false )))
    .catch((err) => console.log(err));

}, [sessions]);

  const navigate = useNavigate();

  const handleRoomJoin = (session) => {
    setRoomId(session._id);

    const roomData = {
      name: user.name,
      roomId: session._id,
      userId:  user._id,
      host: false,
      presenter: false,
      hostId: session.hostid
    };
    setUser(roomData);
    navigate(`/${session._id}`);
    socket.emit("userJoined", roomData);
  };

  return (

<TableContainer component={Paper}>
  <Table aria-label='simple table'>
    <TableHead>
      <TableRow>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Host</TableCell>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Meeting Name</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {
        sessions.map((session) => (
          <TableRow key={session._id}>
            <TableCell>{session.hostname}</TableCell>
            <TableCell>{session.sessionname}</TableCell>
            <TableCell>{ (new Date(session.startdatetime)).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'short', timeStyle: 'short' })}</TableCell>
            <TableCell> <Button variant="contained" onClick={() => handleRoomJoin(session)}> Join </Button> </TableCell>
          </TableRow>
        ))
      }
    </TableBody>
  </Table>
</TableContainer>
        
  );
};

export default JoinRoomForm;
