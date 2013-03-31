/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),

  path = require('path'),
  fs = require('fs'),
  passport = require("passport"),
  BasicStrategy = require('passport-http').BasicStrategy;
// Load configurations
(function() {
  var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env],
    mongoose = require('mongoose'),
    auth = require('./config/middleware/authorisation');

  // Bootstrap db connection
  mongoose.connect(config.db)

  // Bootstrap models
  var models_path = __dirname + '/models'
  fs.readdirSync(models_path).forEach(function(file) {
    require(models_path + '/' + file);
  })

  var app = express();

  require('./config/express')(app, config, passport)
  require('./config/routes')(app, passport, auth)

  var Device = mongoose.model('Device');

  passport.use(new BasicStrategy(

  function(username, password, done) {
    Device.findOne({
      guid: username
    }, function(err, device) {
      if (err) {
        return done(err);
      }
      if (!device) {
        return done(null, false);
      }
      if (!device.authenticate(password)) {
        return done(null, false);
      }
      return done(null, device);
    });
  }));
  module.exports = app;
})();