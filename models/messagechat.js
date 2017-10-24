var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    userName: {type:String},
    userId: {type:String},
    msg: {type:String},
    date: {type: Date, default:Date.now}
});

module.exports = mongoose.model('oldMessage', messageSchema);