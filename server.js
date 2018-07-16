// set up ========================
const express  = require('express');
const app      = express();   
const bodyParser = require('body-parser');
const cors = require('cors');
// firebase
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "REPLACE WITH DATABASEURL FROM SERVICE ACCOUNTS PAGE"
});
const db = admin.firestore();

// configuration =================
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/'));


/////START COPY FOR EACH COLLECTION

// POST ROUTES
let collection = 'posts'; // edit this line to change the name of the collection and routes too

// GET LIST: /api/posts (default)
app.get('/api/'+collection,function(req,res){
  var rows = [];
  db.collection(collection).get().then((snapshot) => {
      snapshot.forEach((doc) => {
        var thisrow = doc.data();
        thisrow.id = doc.id;
        rows.push(thisrow);
      });
      res.send(rows);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

// ADD: /api/posts/add (default)
app.post('/api/'+collection+'/add',function(req,res){
  console.log(req.body);
  db.collection(collection).add(req.body.data).then(function(resp){
    console.log(resp);
    res.status(200).json(resp);
  }).catch(function(err){
    console.log('ERR: ',err);
    res.status(500).json(err);
  });
  
});

// UPDATE: /api/posts/123 (default)
app.put('/api/'+collection+'/:id',function(req,res){
  var id = req.params.id;
  db.collection(collection).doc(id).update(req.body.data).then(function(resp){
    res.status(200).json(resp);
  }).catch(function(err){
    res.status(500).json(err);
  });
});

// SINGLE FIELD UPDATE: /api/posts/123/updatefield (default)
app.post('/api/'+collection+'/:id/updatefield',function(req,res){
  var id = req.params.id;
  var data = req.body;
  db.collection(collection).doc(id).update(data).then(function(resp){
    res.status(200).json(resp);
  }).catch(function(err){
    res.status(500).json(err);
  });
});

// DELETE: /api/posts/123 (default)
app.delete('/api/'+collection+'/:id',function(req,res){
  var id = req.params.id;
  db.collection(collection).doc(id).delete().then(function(resp){
    res.status(200).json(resp);
  }).catch(function(err){
    res.status(500).json(err);
  });
});

/////END COPY FOR EACH COLLECTION


// SET PORT AND OUTPUT RUNNING MESSAGE ======================================
var port = 8081;
app.listen(port);
console.log("App listening on port "+port);