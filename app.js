var createError = require('http-errors');
var express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session'); 



var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

console.log(1)


var app = express();


app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Multer configuration for handling file uploads

var userRouter = require('./routes/user');
var postRouter = require('./routes/post');
var profileRouter = require('./routes/profile');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads/profile')));

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



console.log(3)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

//error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log(4)
const port = process.env.PORT || 3000;
app.listen(port, () => {  
  console.log(`Server is running on port ${port}`);
});
