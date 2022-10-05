import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { DateTimePicker } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Button, Box, Stack, FormControlLabel, Checkbox, TextField} from '@mui/material'

 const CreateRoomForm = ({ uuid, socket, setUser }) => {

  const [roomId, setRoomId] = useState(uuid());
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState((new Date()).toISOString());
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([
    {
        hostname: "",
        sessionname: "",
        startdatetime: ""
    }
  ]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/sessions")
    .then((res) => {
        if (res.ok){
            return res.json();
        }
    })
    .then((jsonRes) => setSessions(jsonRes.filter(s => {
      const date = new Date();
      return s.hostid === user._id && s.isstarted === false && new Date(date.setMinutes(date.getMinutes() - 5)) <= new Date(s.startdatetime) && new Date(s.startdatetime) <=  new Date(date.setMinutes(date.getMinutes() + 15)) && s.isstarted==false && s.isended === false ;
    })))
    .catch((err) => console.log(err));

  }, [sessions]);

  const handleChange = (event) => {
    setChecked(event.target.checked);
    if (event.target.checked){
      setStartTime((new Date()).toISOString());
    }
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();

    const roomData = {
      name: user.name,
      roomId,
      userId: user._id,
      host: true,
      presenter: true,
      startTime: startTime
    };

    const sessionData = {
      hostname: user.name,
      hostid: user._id,
      sessionname: name,
      startdatetime: startTime,
      isstarted: checked,
      isended: false
    };
    fetch("/api/sessions", {method: "POST", body: JSON.stringify(sessionData), headers: {
      'Content-Type': 'application/json'} })
      .then((res) => {
        if (res.ok){
            return res.json();
        }
    })
    .then((jsonRes) => {
      if(sessionData.isstarted){
        roomData.roomId = jsonRes
        setUser(roomData);
        navigate(`/${jsonRes}`);    
        socket.emit("userJoined", roomData);
      }
      else{
        alert("Meeting scheduled successfully");
      }
    })
  };

  const handleStartMeeting = (ses) => {

    const date = new Date();

    const roomData = {
      name: user.name,
      roomId: ses._id,
      userId: user._id,
      host: true,
      presenter: true,
      startTime: date.toISOString()
    };

    const sessionData = {
      hostname: user.name,
      hostid: user._id,
      sessionname: ses.sessionname,
      startdatetime: date.toISOString(),
      isstarted: true,
      isended: false
    };
    
    fetch(`/api/sessions/${ses._id}`, {method: "PATCH", body: JSON.stringify(sessionData), headers: {
            'Content-Type': 'application/json'} })
            .catch((err) => console.log(err));

      if(sessionData.isstarted){
        setUser(roomData);
        navigate(`/${ses._id}`);    
        socket.emit("userJoined", roomData);
      }

  };

  return (
    
  <Stack direction="row" spacing={4}>
    
  <TableContainer component={Paper} sx={{width: '50%'}}>
  <h1 className="text-primary fw-bold">Available Meetings</h1>
  <Table aria-label='simple table'>
    <TableHead>
      <TableRow>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Meeting Name</TableCell>
        <TableCell sx={{fontWeight: "bold", fontSize: 'medium'}}>Start Time</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {
        sessions.map((session) => (
          <TableRow key={session._id}>
            <TableCell>{session.sessionname}</TableCell>
            <TableCell>{ (new Date(session.startdatetime)).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'short', timeStyle: 'short' })}</TableCell>
            <TableCell> <Button variant="contained" onClick={() => handleStartMeeting(session)}> Start </Button> </TableCell>
          </TableRow>
        ))
      }
    </TableBody>
  </Table>
</TableContainer>
<Box sx={{width: '40%'}}>
<h1 className="text-primary fw-bold">Schedule Meeting</h1>
    <form className="form col-md-12 mt-5">
      <div className="form-group">
        <input
          type="text"
          className="form-control my-2"
          placeholder="Enter meeting name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          className="form-control my-2"
          placeholder="Enter meeting description"
        />
      </div>
      <div className="form-group">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker label='Enter meeting time'
        renderInput={(params) => <TextField {...params} />}
        value={startTime}
        onChange={(newValue) => {setStartTime(newValue)}}
      />
      </LocalizationProvider>
      </div>


      <FormControlLabel control={<Checkbox checked={checked} onChange={handleChange}/>} label="Start Now" />

      <Button
        type="submit"
        variant="contained"
        onClick={handleCreateRoom}
        className="mt-4 btn-primary btn-block form-control"
      >
        SCHEDULE
      </Button>
    </form>
    </Box>
    </Stack>
  );
};

export default CreateRoomForm;
