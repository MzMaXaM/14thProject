const
  path = require('path'),
  express = require('express'),
  session = require('express-session'),
  mongodbStore = require('connect-mongodb-session'),
  MongoDbStore = mongodbStore(session),
  db = require('./data/database'),
  demoRoutes = require('./routes/demo');

const app = express();

const sessionStore = MongoDbStore({
  uri: 'mongodb://localhost:27017',
  databaseName: 'auth-demo',
  collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'blog',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}))

app.use(demoRoutes);

app.use(function (error, req, res, next) {
  res.render('500');
})

db.connectToDatabase().then(function () {
  app.listen(3000);
});
