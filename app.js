const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));

var savedPw = "n0t0zer0";
let loggedIn = false;

let db = new sqlite3.Database('./db/demo.db', (err) => {
  if (err) {
    return console.error(err.message);
  }

  console.log('Connected to the SQlite database.')
});

var names = [];

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS Users (Id TEXT, Name TEXT, Org TEXT, Title TEXT, Status TEXT)");
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  loggedIn = false;
  names = [];
  db.each("SELECT * FROM Users WHERE Status = 'Approve'", function(err, row) {
    names.push({name: row.Name, title: row.Title, org: row.Org});
  }, function() {
    console.log(names);
    res.render('index', { data: names, success: true });
  });
});

app.post('/', (req, res) => {

  if (req.body.name != '' && req.body.title != '') {
    var idToAdd = req.body.name.split(' ').join('');
    db.run("CREATE TABLE IF NOT EXISTS Users (ID TEXT, Name TEXT, Org TEXT, Title TEXT, Status TEXT)");
    db.run("INSERT into Users(Id,Name,Org,Title,Status) VALUES (?, ?, ?, ?, ?)", [idToAdd, req.body.name, req.body.org, req.body.title, 'TBD']);
    res.render('thankyou', {data : {name: req.body.name, org: req.body.org}});
  } else {
    res.render ('index', {data: names, success: false});
  }
});

app.get('/admin', (req, res) => {
  console.log("Logged in: " + loggedIn);

  if (loggedIn == false) {
    res.render('auth');
  } else {
    toView = [];
    db.each("SELECT * FROM Users WHERE Status = 'TBD'", function (err, row) {
      toView.push({name: row.Name, org: row.Org, title: row.Title, status: row.Status, id: row.Id});
    }, function() {
      console.log(toView);
      res.render('admin', {data : toView})
    });
  }
});

app.post('/admin', (req, res) => {

  if (loggedIn == false) {
    if (req.body.pw == savedPw) {
      loggedIn = true;
      res.redirect('/admin')
    } else {
      res.render('auth');
    }
  } else {
    var newStatus = req.body.mod.split(' ')[0];
    var toChange = req.body.mod.split(' ').slice(1).join(' ');
    db.run("UPDATE Users SET Status = ? WHERE Name = ?", [newStatus, toChange], function() {
      res.redirect('back');
    });
  }
});

app.get('/resources', (req, res) => {
  res.render('resources');
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Example app listening on port 8000!")
});
