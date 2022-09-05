import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import api from '../../../utils/api';
import { useSelector } from 'react-redux';

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
    .then((jsonRes) => setSessions(jsonRes))
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


  <table>
    <thead>
        <tr>
            <th>Host</th>
            <th>Meeting Name</th>
            {/* <th>Click</th> */}
        </tr>
    </thead>
    <tbody>
    {sessions.map((session) => (
            <tr>
              <td style={{textAlign: 'center'}}>{session.hostname}</td>
              <td style={{textAlign: 'center'}}>{session.sessionname}</td>
              <td style={{textAlign: 'center', paddingLeft: '28px', paddingBottom: '28px'}}> 
              <button onClick={() => handleRoomJoin(session)} className="mt-4 btn-primary btn-block form-control" style={{ height: '30px', width: '70px', color: 'green'}}>
                Join
              </button>
              </td>
            </tr>
          ))}

    </tbody>
</table>

        
  );
};

export default JoinRoomForm;
