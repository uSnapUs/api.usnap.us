/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Event = mongoose.model("Event"),
  im = require('imagemagick');

exports.create = function(req, res) {
  Event.findOne({
    code: req.params.event_code
  }, function(err, existing_event) {

    if (err) {
      res.status(400);
      res.send(err);
      return;
    } else if (!existing_event) {
      res.status(404);
      res.send();
      return;
    } else if (!req.files.photo) {
      res.status(500);
      res.send({
        errors: {
          photo: {
            type: 'required',
            message: 'photo is required'
          }
        }
      })
      return;
    } else {
      im.identify(req.files.photo.path, function(err, features) {
        if (err) throw err;
        var s3id;
        console.log(features);
        existing_event.photos.push(req.body);
        existing_event.save(function(err, saved_event) {
          if (!err) {
            res.send(saved_event);
          } else {
            res.status(400);
            res.send(err);
          }
        });
      });
    }

  });

  return;
};