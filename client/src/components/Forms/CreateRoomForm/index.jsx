import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../../utils/api';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { resetWarningCache } from "prop-types";

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
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group border">
        <div className="input-group d-flex align-items-center jusitfy-content-center">
          <input
            type="text"
            value={roomId}
            className="form-control my-2 border-0"
            disabled
            placeholder="Generate room code"
          />
          <div className="input-group-append">
            <button
              className="btn btn-primary btn-sm me-1"
              onClick={() => setRoomId(uuid())}
              type="button"
            >
              generate
            </button>
            <button
              className="btn btn-outline-danger btn-sm me-2"
              type="button"
            >
              copy
            </button>
          </div>
        </div>
      </div>
      <button
        type="submit"
        onClick={handleCreateRoom}
        className="mt-4 btn-primary btn-block form-control"
      >
        Generate Room
      </button>
    </form>
  );
};

export default CreateRoomForm;
