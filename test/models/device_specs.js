var mongoose = require('mongoose');
var should = require('should');
require("../../models/device");
var Device = mongoose.model('Device');

describe("Device", function(){
	before(function(){
		mongoose.connect(config.db);
	});
			
	describe("#save() a device with just a guid and a name",function(){
		var _err;
		var _device;
		var _saved_device;
		var _guid = "0F0F187A-9AD5-461A-BB56-810BFEF41553";
		var _name = "name";
		before(function(done){
			_device = new Device({
					guid: _guid,
					name:_name
				});
			_device.save(function(err){
					_err = err;
					if(_err)
					{
						done();
					}
					else{
						Device.findById(_device.id,function(err,d){
							_saved_device = d;
							done();
						})
					}					
			});
		});

		it("should save a device that only has a guid and a name",function(){
			should.not.exist(_err);				
		});
		it("should generate a token for a new device",function(){
			_device.token.should.exist;
		});
		it("should have an id",function(){
			_device.id.should.exist;
		});
		it('should save device with correct guid',function(){
			_saved_device.guid.should.equal(_guid);
		});
		it('should save device with correct name',function(){
			_saved_device.name.should.equal(_name);
		});
		after(function(){
		});
	});

	describe("#save() a device without a guid or name",function(){
		var _err;
		var _device;
		var _saved_device;
		before(function(done){
			_device = new Device({
				});
			_device.save(function(err){
					_err = err;
					if(_err)
					{
						done();
					}
					else{
						Device.findById(_device.id,function(err,d){
							_saved_device = d;
							done();
						})
					}					
			});
		});

		it("should error",function(){
			
			
			should.exist(_err);				
			_err.errors.guid.type.should.equal("required");
			_err.errors.name.type.should.equal("required");
		});
		it('should not save a device',function(){
			should.not.exist(_saved_device);
		});
		after(function(){

			
		});
	});
	describe("#save() a device without a name",function(){
		var _err;
		var _device;
		var _saved_device;
		before(function(done){
			_device = new Device({
					guid:"some guid"
				});
			_device.save(function(err){
					_err = err;
					if(_err)
					{
						done();
					}
					else{
						Device.findById(_device.id,function(err,d){
							_saved_device = d;
							done();
						})
					}					
			});
		});

		it("should error",function(){
			
			should.exist(_err);				
				_err.errors.name.type.should.equal("required");
		});
		it('should not save a device',function(){
			should.not.exist(_saved_device);
		});
		after(function(){

			
		});
	});
	describe("#save() a device without a guid",function(){
		var _err;
		var _device;
		var _saved_device;
		before(function(done){
			_device = new Device({
					name:"some name"
				});
			_device.save(function(err){
					_err = err;
					if(_err)
					{
						done();
					}
					else{
						Device.findById(_device.id,function(err,d){
							_saved_device = d;
							done();
						})
					}					
			});
		});

		it("should error",function(){
			
			should.exist(_err);				
				_err.errors.guid.type.should.equal("required");
		});
		it('should not save a device',function(){
			should.not.exist(_saved_device);
		});
		after(function(){

			
		});
	});
	after(function(done){
		Device.remove({},function(){	
			mongoose.disconnect(function(){
					done();
			});			
		});
	
	})
})