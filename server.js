// set up ========================
var env = require('dotenv');
var express  = require('express');
var app      = express();   
const bodyParser = require('body-parser');
const cors = require('cors');
// firebase
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");
const functions = require('firebase-functions');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://whiteflagmobile.firebaseio.com"
});
var db = admin.firestore();
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:me@rncrtr.in',
  'BC1qaKiOtzHYJ_1ZC0pODkVDMuwa-8VHkxNawBvVKBRDkrauLrb0B9Lj5u9TiBm9HjJYo-io_MWSSSn2fii3YW4',
  'REsr8ZCOocyZfKjrZ6ybMb5bmypdLINCzzohZHJgN30'
); 

// configuration =================
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/app'));

// PUSH SUBS
app.post('/api/push/sub',function(req,res){
  // console.log(req.body);
  db.collection('subscriptions').add(req.body).then(function(resp){
    //console.log(resp);
    res.status(200).json(resp);
  }).catch(function(err){
    //console.log('ERR: ',err);
    res.status(500).json(err);
  });
});

// SEND PUSH MESSAGE
app.post('/api/push/sendpn',function(req,res){
  //console.log(req.body.data);
  db.collection('subscriptions').get().then((snapshot) => {
    snapshot.forEach((sub) => {
      var thissub = sub.data();
      //console.log(thissub);
      var pushConfig = {
        endpoint: thissub.endpoint,
        keys: {
          auth: thissub.keys.auth,
          p256dh: thissub.keys.p256dh
        }
      };

      webpush.sendNotification(pushConfig,JSON.stringify(req.body.data))
        .then(function(resp){
          console.log(resp);
          res.status(200).json(resp);
        })
        .catch(function(err){
          console.log(err);
          res.status(500).json(err);
        });
    })
  });
});


// ANNOUNCEMENTS

// GET LIST
app.get('/api/anns',function(req,res){
  var rows = [];
  db.collection('announcements').get().then((snapshot) => {
      snapshot.forEach((doc) => {
        //console.log(doc.id, '=>', doc.data());
        var thisrow = doc.data();
        //console.log(thisrow);
        thisrow.id = doc.id;
        rows.push(thisrow);
      });
      //console.log(rows);
      res.send(rows);
    })
    .catch((err) => {
      console.log('Error getting documents', err);
      res.status(500).json(err);
    });
});

// ADD
app.post('/api/anns/add',function(req,res){
  console.log(req.body);
  db.collection('announcements').add(req.body.data).then(function(resp){
    console.log(resp);
    res.status(200).json(resp);
  }).catch(function(err){
    console.log('ERR: ',err);
    res.status(500).json(err);
  });
  
});

// UPDATE
app.put('/api/anns/:id',function(req,res){
  var id = req.params.id;
  db.collection('announcements').doc(id).update(req.body.data).then(function(resp){
    console.log(resp);
    res.status(200).json(resp);
  }).catch(function(err){
    console.log('ERR: ',err);
    res.status(500).json(err);
  });
});

// REORDER
app.post('/api/anns/:id/reorder',function(req,res){
  var id = req.params.id;
  var data = req.body.data;
  db.collection('announcements').doc(id).update(data).then(function(resp){
    console.log(resp);
    res.status(200).json(resp);
  }).catch(function(err){
    console.log('ERR: ',err);
    res.status(500).json(err);
  });
});

// DELETE
app.delete('/api/anns/:id',function(req,res){
  var id = req.params.id;
  db.collection('announcements').doc(id).delete().then(function(resp){
    console.log(resp);
    res.status(200).json(resp);
  }).catch(function(err){
    console.log('ERR: ',err);
    res.status(500).json(err);
  });
});

app.get('*', function(req, res) { 
  res.sendFile(__dirname + '/app/index.html')
});

// listen (start app with node server.js) ======================================

var port = 8081;
app.listen(port);
console.log("App listening on port "+port);