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
        <Paper>
          <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser} />
        </Paper>
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
