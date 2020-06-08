const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));

let db = new sqlite3.Database('./db/demo.db', (err) => {
  if (err) {
    return console.error(err.message);
  }

  console.log('Connected to the SQlite database.')
});

var names = [];

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS Users (Name TEXT, Org TEXT)");
    // db.run("INSERT into Users(Name,Org) VALUES ('Roopa Vasudevan','Vox Populi')");
    // db.run("INSERT into Users(Name,Org) VALUES ('Anne Ishii','Asian Arts Initiative')");

});

// close the database connection
// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });

app.use(express.static('public'));

app.get('/', (req, res) => {
  names = [];
  db.each("SELECT * FROM Users", function(err, row) {
    names.push({name: row.Name, org: row.Org});
  }, function() {
    console.log(names);
    res.render('index', { data: names });
  });
});

app.post('/', (req, res) => {
  db.run("CREATE TABLE IF NOT EXISTS Users (Name TEXT, Org TEXT)");
  db.run("INSERT into Users(Name,Org) VALUES (?, ?)", [req.body.name, req.body.org]);
  res.render('thankyou', {data : {name: req.body.name, org: req.body.org}});
});

app.get('/resources', (req, res) => {
  res.render('resources');
})

app.listen(process.env.PORT || 5000, () => {
  console.log("Example app listening on port 8000!")
});
