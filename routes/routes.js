var express = require('express');
var router = express.Router();
var User = require('../app/models/user');
var List = require('../app/models/list');
var Item = require('../app/models/task');

module.exports = function(app, passport) {
  // var index = require('../routes/index')(app, passport);
  // app.use('/fun', index);


  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  app.get('/', function(req, res) {
    res.render('index.ejs'); // load the index.ejs file
  });

  app.get('/fun', isLoggedIn, function(req, res, next) {
      List.find({
      userId: req.user._id
    }, function(err, lists) {
      if (err) throw err;


      Item.find({
        listId: req.list_id
      }, function(err, items) {
        if (err) throw err;

        // console.log(items);
        res.render('list', {
          title: 'holy cow',
          user: req.user.local.email,
          stuff: items,
          toDoList: lists
        });
      });
    });
  });

  app.post('/fun', function(req, res) {
    var user = req.user;
    console.log(user._id);

    var listItem = new List({
      name: req.body.item,
      userId: user._id
    });

    listItem.save(function(err, listItem) {
      if (err) throw err;
      res.status(200).json(listItem);
    });
    // var newToDoItem = new Item({
    //   item: req.body.item,
    //   points: req.body.points,
    //   done: false,
    //   userID: user._id

    // });

    // newToDoItem.save(function(err, newToDoItem) {
    //   if (err) throw err;
    //   res.status(200).json(newToDoItem);
    // });
  });

  app.post('/fun/:id', function(req, res, next) {
    var done = req.body.done;
    var item = req.body.item;
    update = {
      $set: {
        done: done,
        item: item
      }
    };
    console.log(update);
    Item.findByIdAndUpdate({
      _id: req.params.id
    }, update, function(err, item) {
      if (err) throw err;
      res.json(item);
    });
  })

  app.post('/fun/delete/:id', function(req, res, next) {
    var id = req.params.id;
    Item.findByIdAndRemove(id, function(err, item) {
      if (err) throw err;
      res.json("Deleted task with id: " + id);
    });
  })


  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
  app.get('/login', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });

  // process the login form
  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));
  // app.post('/login', do all our passport stuff here);

  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  app.get('/signup', function(req, res) {

    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // app.post('/signup', do all our passport stuff here);

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, function(req, res) {
    res.render('profile.ejs', {
      user: req.user // get the user out of session and pass to template
    });
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}
