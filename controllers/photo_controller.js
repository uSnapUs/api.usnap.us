/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Event = mongoose.model("Event"),
  im = require('imagemagick'),
  _ = require('underscore'),
  crypto = require('crypto'),
  knox = require('knox'),
  winston = require('winston');

var _s3Client;

exports.setupRoutes = function(app, passport, auth, config) {

  _s3Client = knox.createClient({
    key: config.aws.key,
    secret: config.aws.secret,
    bucket: config.aws.bucket
  });
  app.post('/event/:event_code/photos', this.create);
};

exports.create = function(req, res) {
  Event.findOne({
    code: req.params.event_code
  }, function(err, existing_event) {
    if(req.files.file&&!req.files.photo)
    {
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
    } else {
      im.identify(req.files.photo.path, function(err, features) {
        if (err) throw err;
        if (_.contains(['JPEG', 'PNG'], features.format)) {
          var file_name_base = crypto.randomBytes(15).toString('hex');

          var photo = {
            thumbnail_url: '/photos/' + existing_event.code + '/' + file_name_base + "_thumbnail.png",
            full_url: '/photos/' + existing_event.code + '/' + file_name_base + ".png",
            root_url: "https://s3.amazonaws.com/"+_s3Client.bucket
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
              _s3Client.putFile(req.files.photo.path + "_thumbnail.png", photo.thumbnail_url,{
                    'x-amz-acl': 'public-read'
                  }, function(err, res) {
              });

            }
          });

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
              _s3Client.putFile(req.files.photo.path + "_full.png", photo.full_url,{
                    'x-amz-acl': 'public-read'
                  }, function(err, res) {
              });

            }
          });
          existing_event.photos.push(photo);
          existing_event.save(function(err, saved_event) {
            if (!err) {
              res.send(saved_event);
            } else {
              res.status(400);
              res.send(err);
            }
          });
        };
      });
    }

  });

  return;
};