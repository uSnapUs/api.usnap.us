/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Event = mongoose.model("Event"),
  Photo = mongoose.model("Photo"),
  im = require('imagemagick'),
  _ = require('underscore'),
  crypto = require('crypto'),
  knox = require('knox'),
  winston = require('winston'),
  fs = require('fs'),
  moment = require('moment');

var _s3Client;

exports.setupRoutes = function(app, passport, auth, config) {
  _s3Client = knox.createClient({
    key: config.aws.key,
    secret: config.aws.secret,
    bucket: config.aws.bucket
  });
  app.post('/event/:event_code/photos', passport.authenticate('basic', {
    session: false
  }), this.create);
  app.get('/event/:event_code/photos', passport.authenticate('basic', {
    session: false
  }), this.list);
  app.post('/event/:event_code/photo/:photo_id/like', passport.authenticate('basic', {
    session: false
  }), this.like);
  app.delete('/event/:event_code/photo/:photo_id/like', passport.authenticate('basic', {
    session: false
  }), this.remove_like);
};

exports.remove_like = function(req, res) {
  if (!req.user.user) {
    res.status(401);
    res.send("user must be logged in");
    return;
  }
  Event.findOne({
    code: req.params.event_code
  })
    .populate('photos.liked_by')
    .exec(function(err, existing_event) {
    if (err) {
      res.status(400);
      res.send(err);
      return;
    } else if (!existing_event) {
      res.status(404);
      res.send();
      return;
    } else {
      var photo = _.find(existing_event.photos, function(photo) {
        return photo._id.toString() == req.params.photo_id
      });
      if (!photo) {
        res.status(404);
        res.send();
        return;
      } else {
        var photo_index = _.indexOf(existing_event.photos, photo);
        var liked_user;
        if ((liked_user = _.find(existing_event.photos[photo_index].liked_by, function(liked_by) {
          return liked_by.equals(req.user.user);
        }))) {
          Photo.findById(existing_event.photos[photo_index]._id, function(photo_err, photo) {
            existing_event.photos[photo_index].liked_by.pull(liked_user);
            photo.liked_by.pull(liked_user);          
            photo.save(function() {
              existing_event.save(function(err, doc) {
                res.status(200);
                res.send(existing_event.photos[photo_index]);
                return;
              });
            });
          });
        } else {
          res.status(200);
          res.send(existing_event.photos[photo_index]);
          return;
        }
      }
    }
  });
};


exports.like = function(req, res) {
  if (!req.user.user) {
    res.status(401);
    res.send("user must be logged in");
    return;
  }
  Event.findOne({
    code: req.params.event_code
  })
    .populate('photos.liked_by')
    .exec(function(err, existing_event) {
    if (err) {
      res.status(400);
      res.send(err);
      return;
    } else if (!existing_event) {
      res.status(404);
      res.send();
      return;
    } else {
      var photo = _.find(existing_event.photos, function(photo) {
        return photo._id.toString() == req.params.photo_id
      });
      if (!photo) {
        res.status(404);
        res.send();
        return;
      } else {
        var photo_index = _.indexOf(existing_event.photos, photo);
        if (!_.find(existing_event.photos[photo_index].liked_by, function(liked_by) {
          return liked_by.equals(req.user.user);
        })) {

          Photo.findById(existing_event.photos[photo_index]._id, function(photo_err, photo) {
            if(!existing_event.photos[photo_index].liked_by){
              existing_event.photos[photo_index].liked_by = [];
            }
            existing_event.photos[photo_index].liked_by.push(req.user.user);
            if(!photo.liked_by)
            {
              photo.liked_by = [];
            }
            photo.liked_by.push(req.user.user);
            photo.save(function() {
              existing_event.save(function(err, doc) {
                res.status(200);
                res.send(existing_event.photos[photo_index]);
                return;
              });
            });

          });

        } else {
          res.status(200);
          res.send(existing_event.photos[photo_index]);
          return;
        }


      }

    }
  });
};

exports.list = function(req, res) {
  Event.findOne({
    code: req.params.event_code
  })
    .populate('photos.posted_by')
    .exec(function(err, existing_event) {
    if (err) {
      res.status(400);
      res.send(err);
      return;
    } else if (!existing_event) {
      res.status(404);
      res.send();
      return;
    } else {
      var photos = existing_event.photos;
      if (req.query.since) {
        var since_moment = moment(req.query.since);
        photos = _.filter(existing_event.photos, function(photo) {
          var creationDate = moment(photo.creation_time.getTime());
          return creationDate.diff(since_moment) > 0;
        });
      }
      res.status(200);
      res.send(photos);
    }
  });
};

exports.create = function(req, res) {
  Event.findOne({
    code: req.params.event_code
  }, function(err, existing_event) {
    if (req.files.file && !req.files.photo) {
      req.files.photo = req.files.file;
    }
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
    } else if (!req.user.user) {
      res.status(401);
      res.send({
        errors: {
          user: {
            message: 'user should be logged in'
          }
        }
      });
      return;
    } else {
      im.identify(req.files.photo.path, function(err, features) {
        if (err) throw err;
        if (_.contains(['JPEG', 'PNG'], features.format)) {
          var file_name_base = crypto.randomBytes(15).toString('hex');

          var photo = {
            thumbnail_url: '/photos/' + existing_event.code + '/' + file_name_base + "_thumbnail.png",
            full_url: '/photos/' + existing_event.code + '/' + file_name_base + ".png",
            root_url: "https://s3.amazonaws.com/" + _s3Client.bucket,
            posted_by: req.user.user,
            posted_by_device: req.user
          }

          im.resize({
            srcPath: req.files.photo.path,
            dstPath: req.files.photo.path + "_thumbnail.png",
            quality: 1,
            format: 'png',
            width: 200,
            height: 200,
            strip: true,
          }, function(err, stdout, stderr) {

            if (!err) {
              _s3Client.putFile(req.files.photo.path + "_thumbnail.png", photo.thumbnail_url, {
                'x-amz-acl': 'public-read'
              }, function(err, res) {});
              im.resize({
                srcPath: req.files.photo.path,
                dstPath: req.files.photo.path + "_full.png",
                quality: 1,
                format: 'png',
                width: features.width,
                height: features.height,
                strip: false,
              }, function(err, stdout, stderr) {

                if (!err) {
                  _s3Client.putFile(req.files.photo.path + "_full.png", photo.full_url, {
                    'x-amz-acl': 'public-read'
                  }, function(err, res) {
                    fs.unlink(req.files.photo.path + "_thumbnail.png");
                    fs.unlink(req.files.photo.path + "_full.png");
                    fs.unlink(req.files.photo.path);

                  });

                }
              });
            }



          });

          if (!existing_event.photos) {
            existing_event.photos = [];
          }

          var photo_model = new Photo(photo);


          photo_model.save(function(err, saved_photo) {
            existing_event.photos.push(saved_photo);
            existing_event.save(function(err, saved_event) {
              if (!err) {
                res.send(photo);
              } else {
                res.status(400);
                res.send(err);
              }
            });
          });
        };
      });
    }
  });
  return;
};