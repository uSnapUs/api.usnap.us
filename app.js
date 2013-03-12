
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , passport = require ("passport");

// Load configurations
var env = process.env.NODE_ENV || 'development'
  , config = require('./config/config')[env]
  , mongoose = require('mongoose')
  , auth = require('./config/middleware/authorisation')

// Bootstrap db connection
mongoose.connect(config.db)

// Bootstrap models
var models_path = __dirname + '/models'
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file)
})

var app = express();

require('./config/express')(app, config, passport)
require('./config/routes')(app, passport, auth)

var port = process.env.PORT || 3000
http.createServer(app).listen(port, function(){
  console.log("Express server listening on port " + port);
});
