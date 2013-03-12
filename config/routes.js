
var mongoose = require('mongoose')
  , async = require('async')

module.exports = function (app, passport, auth) {
   var device_controller = require('../controllers/device_controller')
   app.post('/device',device_controller.register);

}
