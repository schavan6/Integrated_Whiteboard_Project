const express = require('express');
const router = express.Router();

const Session = require('../../models/Session');

// @route    GET api/sessions
// @desc     Get all sessions
// @access   Private
router.get('/', async (req, res) => {
    try {
      const sessions = await Session.find();
      res.json(sessions);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
});

// @route    POST api/sessions
// @desc     Create a session
// @access   Private
router.post('/', async (req, res) => {
  
      try {
        const newSession = new Session({
          hostname: req.body.hostname,
          hostid: req.body.hostid,
          sessionname: req.body.sessionname
        });
  
        const session = await newSession.save();
        res.status(201).json(session._id);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    }
  );

  module.exports = router;