import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';


 const CreateRoomForm = ({ uuid, socket, setUser }) => {
  const [roomId, setRoomId] = useState(uuid());
  const [name, setName] = useState("");
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate();

  const handleCreateRoom = (e) => {
    e.preventDefault();

    const roomData = {
      name: user.name,
      roomId,
      userId: user._id,
      host: true,
      presenter: true,
    };

    const sessionData = {
      hostname: user.name,
      hostid: user._id,
      sessionname: name
    };

    fetch("/api/sessions", {method: "POST", body: JSON.stringify(sessionData), headers: {
      'Content-Type': 'application/json'} })
      .then((res) => {
        if (res.ok){
            return res.json();
        }
    })
    .then((jsonRes) => {
        roomData.roomId = jsonRes
        setUser(roomData);
        navigate(`/${jsonRes}`);    
        socket.emit("userJoined", roomData);
    })
  };

  return (
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
      <Button
        type="submit"
        variant="contained"
        onClick={handleCreateRoom}
        className="mt-4 btn-primary btn-block form-control"
      >
        START
      </Button>
    </form>
  );
};

export default CreateRoomForm;
