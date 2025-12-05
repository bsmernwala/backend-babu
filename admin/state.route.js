
const express = require('express');
const stateRoute = express.Router(); 
const mongoose = require('mongoose');

var State = require('./state.model'); 

//function to save state
stateRoute.route
('/save').
post( (req, res)=> {
   
var state = new State(req.body);
  state.save().then(state => {
      res.send("State  Saved");
      res.end();
     
    }).catch(err => { 
    res.send
    (err);
    res.end();
    });
});
//search state
stateRoute.route
('/search/:stid').get((req, res)=> {
   
  State.findOne({"stid":req.params.stid})
    .then(state => {      
      res.send(state);
      res.end();
    }).catch(err => {
    res.send
    (err);
    });
});
stateRoute.route
('/test').get((req, res)=> {
   
  res.send("state route is working fine again and again2---");
  res.end();
  
});       
//update state
stateRoute.route
('/update').
put((req, res)=> {
    
  State.updateOne({"stid":req.body.stid},{"stid":req.body.stid,"stname":req.body.stname,"status":req.body.status}).then(state => {
      res.send('state updated successfully');
      res.end();
      
    })
    .catch((err) => { 
      res.send(err);
      res.end();
    });      
  });
//delete enable or disable 
stateRoute.route
('/delete/:stid').delete((req, res)=> {
   
    State.updateOne({"stid":req.params.stid},{"status":0}).then(state => {
        res.send('state disabled successfully');
        res.end();
        
      })
      .catch((err) => { 
        res.send(err);
        res.end();
      });      
    });

//show all used to get all data from mongodb
stateRoute.route
('/show').get(function (req, res) {        
  State.find({"status":1})
    .then(state => {      
      res.send(state);
      res.end();
    }).catch(err => {
    res.send
    (err);
    res.end();
    });
});

//show all 
stateRoute.route
('/getall').get(function (req, res) {        
  State.find()
    .then(state => {      
      res.send(state);
      res.end();
    }).catch(err => {
    res.send
    (err);
    res.end();
    });
});

//search state by name to avoid duplicate entery
stateRoute.route
('/searchbyname/:stname').get((req, res)=> {
   
  State.findOne({"stname":req.params.stname})
    .then(state => {      
      res.send(state);
      res.end();
    }).catch(err => {
    res.send
    (err);
    });
});

stateRoute.get('/debug', async (req, res) => {
  try {
    const dbName = mongoose.connection.name;
    const collections = await mongoose.connection.db.listCollections().toArray();
    const colNames = collections.map(c => c.name);

    const stats = {};
    for (const name of colNames) {
      try {
        const col = mongoose.connection.db.collection(name);
        stats[name] = {
          count: await col.countDocuments(),
          sample: await col.findOne() // may be null
        };
      } catch(e) {
        stats[name] = { error: e.message };
      }
    }

    // Also check State model specifically
    const stateCount = await State.countDocuments().catch(e => `err:${e.message}`);
    const stateSample = await State.findOne().lean().catch(e => `err:${e.message}`);

    return res.json({ dbName, colNames, stats, stateCount, stateSample });
  } catch (err) {
    console.error('debug error', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = stateRoute;
