import CreateRoomForm from './CreateRoomForm';
import JoinRoomForm from './JoinRoomForm';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import './index.css';

const Forms = ({ auth, uuid, socket, setUser }) => {
  return (
    <div className="row h-100 pt-5">
      {auth.user && auth.user.role === 'Instructor' && (
        <div className="col-md-4 mt-5 form-box p-5 border border-primary rounded-2 mx-auto d-flex flex-column align-items-center">
          <h1 className="text-primary fw-bold">Create Room</h1>
          <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser} />
        </div>
      )}
      {auth.user && auth.user.role === 'Student' && (
        <div className="col-md-4 mt-5 form-box p-5 border border-primary rounded-2 mx-auto d-flex flex-column align-items-center">
          <h1 className="text-primary fw-bold">Join Room</h1>
          <JoinRoomForm uuid={uuid} socket={socket} setUser={setUser} />
        </div>
      )}
    </div>
  );
};

Forms.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(Forms);
