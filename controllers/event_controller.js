/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Event = mongoose.model('Event');
var photo_controller = require('../controllers/photo_controller');
exports.setupRoutes = function(app,passport,auth){
  app.post('/events', passport.authenticate('basic', { session: false }),this.create);
  app.post('/event/:event_code/photos',photo_controller.create);
  app.get('/event/:event_code',passport.authenticate('basic',{session:false}),this.get);
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
        res.send(saved_event);
      } else {
        res.status(400);
        res.send(err);
      }
    });
  });

  return;
};
exports.get = function(req,res){
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