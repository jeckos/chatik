var express = require('express');
var router = express.Router();
var User = require('../models/user');
var oldMessage = require('../models/messagechat');
var IDSoc = require('../bin/www');

/* GET home page. */

router.get('/', isLoggedIn, function(req, res, next) {
    var ID = req.session.passport.user;
    User.findOne({'_id': ID}, function (err, user) {
        res.render('chat/index', { title: 'Chatik', username: user.username});

        user.save();
    });


});

router.get('/setting', isLoggedIn, function (req,res, next) {
    var ID = req.session.passport.user;
    User.findOne({'_id': ID}, function (err, user) {
        console.log(req.session)
    res.render('user/setting', {username: user.username})

    });
});
router.post('/setting', function (req, res, next) {
    var ID = req.session.passport.user;
    User.findOne({'_id': ID}, function (err, user) {
        if(req.body.changename == ''){
            return next(err);
        }else{
            oldMessage.find({'userId' : ID}, function (err, result) {
                if(err)throw err;
                for(var i = 0; i <result.length; i++){
                    result[i].userName = req.body.changename;
                    result[i].save();
                }
                // console.log(result)
            } );
            user.username = req.body.changename;
        }
        res.render('user/setting', { title: 'Chatik', username: user.username});
        user.save();
    });
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('user/signin');
}

module.exports = router;
