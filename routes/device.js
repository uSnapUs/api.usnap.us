module.exports = function(mongoose) {
  var collection = 'devices';
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var schema = new Schema({
    Id:ObjectId
    
  });

  this.model = mongoose.model(collection, schema);

  return this;
};  