var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
   User.findById(id, function (err, user) {
       done(err, user);
   });
});

passport.use('local.signup', new  LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Email введено не коректно').notEmpty().isEmail();
    req.checkBody('password', 'Пароль должен быть не менее 4 символов').notEmpty().isLength({min:4});
    var username = req.body.username;
    var errors = req.validationErrors();
    if (errors){
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function (err, user) {
        if(err){
            return done(err);
        }
        if(user){
            return done(null, false, {message: 'Такой Email уже используеться.'});
        }
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.username = username;
        newUser.save(function (err, result) {
            if(err){
                return done(err);
            }
            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Email введен не верно! Повторите попытку ').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors){
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function (err, user) {
        if(err){
            return done(err);
        }
        if(!user){
            return done(null, false, {message: 'Пользователь  не найден'});
        }
        if(!user.validPassword(password)){
            return done(null, false, {message: 'Пароль введен не верно! Повторите попытку'});
        }
     return done(null, user);
    });
}));