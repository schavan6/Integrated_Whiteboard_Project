import CreateRoomForm from './CreateRoomForm';
import JoinRoomForm from './JoinRoomForm';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {Paper, Typography} from '@mui/material';

import './index.css';

const Forms = ({ auth, uuid, socket, setUser }) => {
  return (
    <div className="row h-100 pt-5">
      {auth.user && auth.user.role === 'Instructor' && (
        <div className="col-md-4 mt-5 form-box p-5 border border-primary rounded-2 mx-auto d-flex flex-column align-items-center">
          <h1 className="text-primary fw-bold">Start Meeting</h1>
          <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser} />
        </div>
      )}
      {auth.user && auth.user.role === 'Student' && (
        <Paper>
           <Typography align='center' fontSize='40px' className="text-primary fw-bold">Join Meeting</Typography>
          <JoinRoomForm uuid={uuid} socket={socket} setUser={setUser} />
        </Paper>
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
