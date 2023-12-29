const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayout = require('express-ejs-layouts');
const db = require('./models/database');
const session = require('express-session');
// const fileUpload = require('express-fileupload')
const nocache = require('nocache');
// const Category = require('./models/category'); 
const razorpay = require('razorpay');
const fs = require('fs')



const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const paginate = require('express-paginate');

const app = express();


app.use(session({
  secret: "Secret key",
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 500000000
  }
}))



// view engine setup
app.use(expressLayout);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('layout','./layout/layout');


app.use(nocache());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/admin',express.static(path.join(__dirname, 'public')));
app.use('/user',express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', adminRouter);
app.use('/user', userRouter);
app.use('/add-product', express.static('uploads'));
app.use('/admin',express.static('uploads'));
app.use(paginate.middleware(5,20));









// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, ()=>{
  console.log('port connected on 3000');
})

module.exports = app;


