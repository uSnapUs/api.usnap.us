/**
 * Module dependencies.
 */
var mongoose = require('mongoose');

exports.create = function(req, res) {
  var Event = mongoose.model('Event');
  var ev = new Event(req.body);
  Event.findOne({
    id: ev.id
  }, function(err, existing_event) {

    if (err || existing_event == null) {
      existing_event = ev;
    } else {
      existing_event.name = ev.name;
    }
    existing_event.save(function(err, saved_event) {
      if (!err) {
        res.send(saved_event);
      } else {
        res.status(400);
        res.send(err);
      }
    });
  });

  return;
};