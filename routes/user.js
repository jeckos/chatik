var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var IDSoc = require('../bin/www');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/logout', isLoggedIn, function (req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

router.use('/', notLoggedIn, function (req, res, next) {
    next();
});

router.post('/setting', function (req, res, next) {
        console.log(req.body.changename);
});

router.get('/signup', function (req, res, next) {
    var message = req.flash('error');
    res.render('user/signup', {title:'Sign Up',csrfToken: req.csrfToken(), messages: message, hasErrors:message.length>0})
});

router.post('/signup', passport.authenticate('local.signup',{
    successRedirect: 'chat/index',
    failureRedirect: '/user/signup',
    failureFlash: true

}));

router.get('/signin', function (req, res, next) {
    var message = req.flash('error');
    res.render('user/signin', {title:'Sign In',csrfToken: req.csrfToken(), messages: message, hasErrors:message.length>0})
});
router.post('/signin',passport.authenticate('local.signin',{
    successRedirect: 'chat/index',
    failureRedirect: '/user/signin',
    failureFlash: true
}));



function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/user/signin');
}

function notLoggedIn(req, res, next) {
    if(!req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}

module.exports = router;

