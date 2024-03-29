
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , _ = require('underscore')
  , authTypes = ['basic']
  ,timestamps = require('mongoose-timestamp');

/**
* User Schema
*/
var UserSchema = new Schema({
  name:{type:String},
  facebook_id:{type:String},
  email:{type:String},
});
UserSchema.plugin(timestamps);
try {
  mongoose.model('User');
}catch(e){
  mongoose.model('User', UserSchema);
}

/**
 * Device Schema
 */

var DeviceSchema = new Schema({
  name: {type:String,required:true},
  guid: {type:String,required:true},
  hashed_token: String,
  salt: String,
  user:{type : Schema.ObjectId, ref : 'User'}
});
DeviceSchema.plugin(timestamps);
DeviceSchema.set('autoIndex', true);
/**
 * Virtuals
 */

DeviceSchema
  .virtual('token')
  .set(function(token) {
    this._token = token
    this.salt = this.makeSalt()
    this.hashed_token = this.encryptPassword(token)
  })
  .get(function() { return this._token })

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length
}

DeviceSchema.set('toJSON',{virtuals:true});
DeviceSchema.options.toJSON.transform=function(doc,ret,options){
  delete ret.hashed_token;
  delete ret.salt;
  delete ret._id;
  delete ret.__v;
};

// the below 4 validations only apply if you are signing up traditionally

DeviceSchema.path('name').validate(function (name) {
  validatePresenceOf(name);
}, 'Name cannot be blank')

DeviceSchema.path('guid').validate(function (guid) {
  validatePresenceOf(guid);
}, 'Guid cannot be blank')

DeviceSchema.path('hashed_token').validate(function (hashed_token) {
  validatePresenceOf(hashed_token);
}, 'Token cannot be blank')


/**
 * Pre-save hook
 */

DeviceSchema.pre('save', function(next) {
  if (!this.isNew) return next();
  this.token =  crypto.randomBytes(48).toString('hex');
  next();
  
})

/**
 * Methods
 */

DeviceSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_token
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function() {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function(password) {
    if (!password) return ''
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
  },
  createToken:function(){
    crypto.randomBytes(48, function(ex, buf) {
      return buf.toString('hex');
    });
  },

}
try {
  mongoose.model('Device');
}catch(e){
  mongoose.model('Device', DeviceSchema);
}


