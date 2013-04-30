/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var SendGrid = require('sendgrid').SendGrid;
var sendgrid;
exports.setupRoutes = function(app, passport, auth, config) {
  sendgrid = new SendGrid(config.email_user, config.email_key);
  app.post('/events', passport.authenticate('basic', {
    session: false
  }), this.create);
  app.get('/event/:event_code', passport.authenticate('basic', {
    session: false
  }), this.get);
  app.get('/events/by_location', passport.authenticate('basic', {
    session: false
  }), this.getByLocation);
};
exports.create = function(req, res) {
 
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
        if (req.user && req.user.email) {
          console.log('sending email');
          sendgrid.send({
            to: req.user.email,
            from: "events@app.usnap.us",
            subject: 'New Event Created',
            text: JSON.stringify(saved_event.toJSON()),
          }, function(success, message) {
            if (!success) {
              console.log(message);

            }
          });
        }       
        res.send(saved_event);
      } else {
        res.status(400);
        res.send(err);
      }
    });
  });

  return;
};
exports.get = function(req, res) {
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
    } else {
      res.status(200);
      res.send(existing_event);
      return;
    }

  });

  return;
};
exports.getByLocation = function(req, res) {
  var point = {
    type: 'Point',
    coordinates: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)]
  };
  Event.find({
    location: {
      $near: {
        $geometry: point,
        $maxDistance: 2000
      }
    }
  }, function(err, docs) {
    if (err) {
      res.status(500);
      res.send(err);
      return;
    } else {
      res.status(200);
      res.send(docs);
      return;
    }
  });
  return;
};