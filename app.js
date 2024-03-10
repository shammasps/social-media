var createError = require('http-errors');
var express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session'); 
const exphbs = require('express-handlebars');


var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

console.log(1)


var app = express();


// Configure Handlebars as the view engine
const hbs = exphbs.create({
  helpers: {
    formatDate: function (dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  },
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views'),
  // Allow prototype access
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Multer configuration for handling file uploads

var userRouter = require('./routes/user');
var postRouter = require('./routes/post');
var profileRouter = require('./routes/profile');
var chatRouter = require('./routes/chat');
var clubRouter = require('./routes/club');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads/profile')));
app.use('/uploads/jersy', express.static(path.join(__dirname, 'uploads/jersy')));

console.log(2)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));


app.use('/', userRouter);
app.use('/post', postRouter);
app.use('/profile', profileRouter);
app.use('/chat', chatRouter);
app.use('/club', clubRouter);



console.log(3)
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

app.use((err, req, res, next) => {
  console.error(err);
  // Redirect to the home route or any other route you prefer
 // res.redirect('/');

  // Optionally, you can also send an error response to the client
  // res.status(500).send('Internal Server Error');
});

console.log(4)
const port = process.env.PORT || 3000;
app.listen(port, () => {  
  console.log(`Server is running on port ${port}`);
});
