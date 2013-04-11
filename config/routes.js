
var mongoose = require('mongoose')
  , async = require('async');
var device_controller = require('../controllers/device_controller');
var event_controller = require('../controllers/event_controller');
var photo_controller = require('../controllers/photo_controller');

module.exports = function (app, passport, auth) {
   app.post('/devices',device_controller.create);
   event_controller.setupRoutes(app,passport,auth);
   app.delete('/devices',device_controller.delete);
}
