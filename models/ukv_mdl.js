var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

  var UKVSchema = new Schema({
    uid         : String
    ,keyName    : String
    ,keyValue   : String
});


module.exports = mongoose.model('UKVModel', UKVSchema)
