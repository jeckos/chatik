#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('shopping-cart:server');
var http = require('http');
var config = require('../config');
var cookie = require('cookie');
var mongodb = require('mongodb');
var sessionStore = require('../lib/sessionStore');
var cookieParser = require('cookie-parser');
var async = require('async');
var User = require('../models/user');
var oldMessage = require('../models/messagechat');


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '8000');
app.set('port', port);
console.log('Server RUN');

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
console.log('Connect');


    function loadSession(sid, callback) {

        // sessionStore callback is not quite async-style!
        sessionStore.load(sid, function(err, session) {
            if (arguments.length == 0) {
                // no arguments => no session
                return callback(null, null);
            } else {
                return callback(null, session);
            }
        });

    }

    function loadUser(session, callback) {

        if (!session.passport.user) {

            return callback(null, null);
        }


        var ID = session.passport.user;

        User.findOne({'_id': ID}, function(err, user) {
            if (err) {
                return callback(err);
            }

            if (!user) {

                return callback(null, null);
            }
            callback(null, user);
        });

    }
    var handshakes ={};
    var io = require('socket.io').listen(server);

    app.use(cookieParser());
    io.set('authorization', function (handshake, callback) {
        async.waterfall([
                function (callback) {
                    handshake.cookies = cookie.parse(handshake.headers.cookie||'')

                    var sidCookie = handshake.cookies[config.get('session:key')];
                    var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));
                    loadSession(sid, callback);

                },
                function(session, callback) {

                    if (!session) {
                        callback(console.log(error));
                    }

                    handshake.session = session.passport.user;

                    loadUser(session, callback);
                },
                function(user, callback) {
                    if (!user) {
                        callback(console.log(error));
                    }

                    handshake.user = user.username;

                    callback(null);

                    return handshakes = handshake;
                }
            ],
            function(err) {
                if (!err) {
                    return callback(null, true);
                }

                if (err) {
                    return callback(null, false);
                }

                callback(err);

            });

    });


    io.sockets.on('connection', function (socket) {






        var username = handshakes.user,
            userid   = handshakes.session;

        //console.log(username);

        oldMessage.find({}, function (err, docs) {
            if(err) throw err;
            socket.emit('load old message', docs, username, userid);
        });


        socket.on('message', function (text, cb) {
            console.log(socket.conn.request.session);
            var newMsg = new  oldMessage({userName: username, userId: socket.conn.request.session, msg: text});
            newMsg.save(function (err) {
                if(err) throw err;

                socket.broadcast.emit('message', username, text);
                cb && cb();
            })


        });

        socket.on('disconnect', function() {
            socket.broadcast.emit('leave', username);
        });

        return io;

    });







/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

