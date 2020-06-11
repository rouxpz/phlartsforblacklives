const express = require('express');
const { Client } = require('pg');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'LOCAL DB HERE'
});

client.connect();

var savedPw = "PASSWORD HERE";
var pwToTest = '';

io.on('connection', (socket) => {

  socket.on('password', (msg) => {
    pwToTest = msg;
  });

  socket.on('status', (msg) => {
    if (msg == 'in admin') {
      //nothing here
    }
  });

  socket.on('logout', (msg) => {
    pwToTest = '';
  });

  socket.on('disconnect', () => {
    //nothing here
  });
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  var names;
  client.query("SELECT * FROM Users WHERE Status='Approve'", (err, result) => {
    if (err) throw err;
    names = result.rows;
    res.render('index', { data: names, success: true });
    // client.end();
  });
});

app.post('/', (req, res) => {
  if (req.body.name != '' && req.body.title != '') {
    var idToAdd = req.body.name.split(' ').join('');
    // db.run("CREATE TABLE IF NOT EXISTS Users (ID TEXT, Name TEXT, Org TEXT, Title TEXT, Status TEXT)");
    // client.connect();
    client.query('INSERT INTO users(id,name,org,title,status) VALUES($1, $2, $3, $4, $5)', [idToAdd, req.body.name, req.body.org, req.body.title, 'TBD']);

    res.render('thankyou', {data : {name: req.body.name, org: req.body.org}});
  } else {
    res.render ('index', {data: names, success: false});
  }
});


app.get('/admin', (req, res) => {
  res.render('auth');
});

app.post('/admin', (req, res) => {
  if (pwToTest == savedPw) {
    res.redirect('/authorized');
  } else {
    res.render('auth');
  }
});

app.get('/authorized', (req, res) => {
  if (pwToTest == savedPw) {
    pwToTest = '';
    var toView;
    client.query("SELECT * FROM users WHERE status='TBD'", (err, result) => {
      if (err) throw err;
      toView = result.rows;
      res.render('admin', {data : toView});
    });
  } else {
    res.redirect('/admin');
  }
});

app.post('/authorized', (req, res) => {
  pwToTest = savedPw;
  var newStatus = req.body.mod.split(' ')[0];
  var toChange = req.body.mod.split(' ').slice(1).join(' ');

  client.query("UPDATE users SET status = ($1) WHERE name = ($2)", [newStatus, toChange]);
  res.redirect('/authorized');
});

app.get('/resources', (req, res) => {
  res.render('resources');
});

http.listen(process.env.PORT || 5000, () => {
  console.log("App listening on port!")
});
