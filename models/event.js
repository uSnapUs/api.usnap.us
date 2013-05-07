
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , _ = require('underscore')
  , authTypes = ['basic']
  , moment = require('moment')
  ,timestamps = require('mongoose-timestamp');



/**
* Photo Schema
*/
var PhotoSchema = new Schema({
  liked_by:[{type:Schema.ObjectId, ref : 'User'}],
  thumbnail_url:{type:String},
  full_url:{type:String},
  root_url:{type:String},
  posted_by:{type : Schema.ObjectId, ref : 'User'},
  posted_by_device:{type : Schema.ObjectId, ref : 'Device'},
  creation_time:{type:Date,default:Date.now}
});
PhotoSchema.plugin(timestamps);

PhotoSchema
  .virtual('likes')
  .get(function() { return this.liked_by.length; })
PhotoSchema.set('toJSON',{virtuals:true});


/**
 * Event Schema
 */

var EventSchema = new Schema({
  name: {type:String,required:true},
  location:{type:{type:String},coordinates:[]},
  address:{type:String},
  start_date:{type:Date,required:true},
  end_date:{type:Date,required:true},
  code:{type:String,unique:true},
  is_public:{type:Boolean,required:true,default:false},
  photos:[PhotoSchema]
});
EventSchema.plugin(timestamps);
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



try{
  mongoose.model('Event');
}
catch(e){
  mongoose.model('Event', EventSchema);  
}
try{
  mongoose.model('Photo');
}
catch(e){
  mongoose.model('Photo',PhotoSchema);
}
