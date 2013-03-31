
var mongoose = require('mongoose')
  , async = require('async');
var device_controller = require('../controllers/device_controller');
var event_controller = require('../controllers/event_controller');
var photo_controller = require('../controllers/photo_controller');

module.exports = function (app, passport, auth) {
   app.post('/devices',device_controller.create);
   app.post('/events', passport.authenticate('basic', { session: false }),event_controller.create);
   app.post('/event/:event_code/photos',photo_controller.create);
}
