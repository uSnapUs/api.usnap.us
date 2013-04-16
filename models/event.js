
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , _ = require('underscore')
  , authTypes = ['basic']
  , moment = require('moment');



/**
* Photo Schema
*/
var PhotoSchema = new Schema({
  creation_date_utc:{type:Date,default:moment.utc(),required:true},
  likes:{type:Number,default:0},
  thumbnail_url:{type:String},
  full_url:{type:String},
  root_url:{type:String}
});

/**
 * Event Schema
 */

var EventSchema = new Schema({
  name: {type:String,required:true},
  creation_date_utc:{type:Date,default:moment.utc(),required:true},
  location:{type:{type:String},coordinates:[]},
  address:{type:String},
  start_date:{type:Date,required:true},
  end_date:{type:Date,required:true},
  code:{type:String,unique:true},
  is_public:{type:Boolean,required:true,default:false},
  photos:[PhotoSchema]
});
EventSchema.set('autoIndex', true);
PhotoSchema.set('autoIndex', true);
EventSchema.path('location.coordinates').required(true);
EventSchema = EventSchema.index({location:'2dsphere'});

EventSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  if(!this.code){
    this.code =  crypto.randomBytes(3).toString('hex').toUpperCase();
  }
  next();
  
})

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length
}


EventSchema.set('toJSON',{virtuals:true});
EventSchema.options.toJSON.transform=function(doc,ret,options){
  delete ret._id;
  delete ret.__v;
};

// the below 4 validations only apply if you are signing up traditionally

EventSchema.path('name').validate(function (name) {
  validatePresenceOf(name);
}, 'Name cannot be blank')
EventSchema.path('location.coordinates').validate(function (coordinates) {
  validatePresenceOf(coordinates);
}, 'Coordinates cannot be blank')




mongoose.model('Event', EventSchema)
mongoose.model('Photo',PhotoSchema)