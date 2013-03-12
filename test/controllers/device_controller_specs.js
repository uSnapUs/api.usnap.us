var mongoose = require('mongoose');
require("../../models/device");
var Device = mongoose.model('Device');
var devices = require("../../controllers/device_controller");
var should = require('should');
var sinon = require('sinon');
describe('DeviceController',function(){
	describe('#register with new device',function(done){
		var _result;
		var _guid = "0F0F187A-9AD5-461A-BB56-810BFEF41553";
		var _saved_device;
		var _saved_callback;
		var _stubModel;
		var _statusCode;
		before(function(done){
			var cb = function(callback){
				_saved_device = this;
				_saved_callback = callback;
				if (callback) {
					callback();
					done();
				}
				else{
					done();
				}
				
					
			};
			_stubModel = sinon.stub(Device.prototype, 'save',cb);
			
			var res={
				status:function(status_code)
				{
					_statusCode = status_code;
				},
				send:function(object){
					_result = object;
				}
			};
			
			var req={
				body:{
					guid:_guid,
					name:"name"
				}
			};

			devices.register(req,res);
		});
		after(function(){
			_stubModel.restore();
		});
    	it('should have saved a device',function(){
    		should.exist(_saved_device);
    	});
    	it('should have saved correct guid',function(){
    		_saved_device.guid.should.equal(_guid);
    	});
		it('should return a result',function(){
			should.exist(_result);
		});
		it('should return a device token',function(){
			_result.should.equal(_saved_device);
		});
		it('should return correct device',function(){
			_saved_device.authenticate(_result.token).should.be.true;
		});
		
	});
describe('#register with an invalid new device', function(done){
	var _result;
	var _guid = "0F0F187A-9AD5-461A-BB56-810BFEF41553";
		var _saved_device;
var _statusCode;
	var _stubModel;
 
      before(function(done){
			var cb = function(callback){
				_saved_device = this;
				_saved_callback = callback;
				if (callback) {
					callback();
				}
				else{
				}
				
					
			};
			_stubModel = sinon.stub(Device.prototype, 'save',cb);
			
			var res={
				status:function(status_code)
				{
					_statusCode = status_code;
				},
				send:function(object){
					_result = object;
					done();
				}
			};
			
			var req={
				body:{
					guid:_guid,
				}
			};

			devices.register(req,res);
		});
		after(function(){
			_stubModel.restore();
		});
    	it('should not have saved a device',function(){
    		should.not.exist(_saved_device);
    	});
		it('should return a result',function(){
			should.exist(_result);
		});
		it('should return the error',function(){
			_result.errors.name.type.should.equal('required');
		});
		it('should return a 400 status code',function(){
			_statusCode.should.equal(400);
		})
	
		  

})
});
