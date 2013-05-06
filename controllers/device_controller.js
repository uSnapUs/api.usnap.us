/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var passport = require('passport');

exports.setupRoutes = function(app, passport, auth, config) {
  app.post('/devices', this.create);
  app.delete('/devices', this.delete);
};

exports.create = function(req, res, next) {
  passport.authenticate('basic', function(auth_err, usr, info) {
    var Device = mongoose.model('Device');
    var User = mongoose.model('User');
    var device = new Device(req.body);


    Device.findOne({
      guid: device.guid
    }, function(err, existing_device) {
      if (err || existing_device == null) {
        existing_device = device;
      } else {
        if (!usr || usr.guid != existing_device.guid) {
          res.status(401);
          res.send("unauthorised to update this device");
          return;
        }
        existing_device.email = device.email;
        existing_device.name = device.name;
      }
      var user = new User();
      if (req.body.user && req.body.user.facebook_id) {
        user = new User(req.body.user);        
        User.findOne({
          facebook_id: user.facebook_id
        }, function(err, existing_user) {
          if (!err && existing_user) {
            user = existing_user;
          }
        });
        existing_device.user = user;

      }
      existing_device.save(function(err, saved_device) {
        if (!err) {
          user.save(function(err, saved_user) {
            if (!err) {
              res.send(saved_device);
            } else {
              res.status(400);
              res.send(err);
            }
          });
        } else {
          res.status(400);
          res.send(err);
        }

      });
    });
  })(req, res, next);
};
exports.delete = function(req, res, next) {
  var Device = mongoose.model('Device');
  Device.count({}, function(err, count) {
    if (count) {
      Device.remove({}, function() {
        res.status(200);
        res.send("done");
      });
    } else {
      res.status(200);
      res.send("done");
    }
  });
};