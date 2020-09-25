const keys = require('../config/keys');
const redis = require('redis');

var client = redis.createClient({port:keys.redisPort, host: keys.redisHost, password:keys.redisPWD});
client.on('connect', function(){
  console.log('Redis Connection Successfull');
});

var redisWFInst = function(inst, callback) {
  client.hget(inst, "flowdef", function(err, value) {
    if(err) callback(err)
    callback(null, value)
  })
}

var instanceNumber = function(key, callback) {
  client.incr(key, function(err, instNum) {
    if(err) callback(err)
    callback(null, instNum)
  })
}

var newInst = function(key, wfId, wfDef, status, callback) {
  client.hmset(key, "flowdef", JSON.stringify(wfDef), "flowID", wfId, "status", status, function (err, result) {
    if (err) callback(err)
    callback(null, result)
  })
}

var updateInst = function(key, wfDef, status, callback) {
  client.hmset(key, "flowdef", JSON.stringify(wfDef), "status", status, function (err, result) {
    if (err) callback(err)
    callback(null, result)
  })
}

var logInst = function(key, wfDef, log, callback) {
  wfDef.inst.logs.push(log);
  client.hmset(key, "flowdef", JSON.stringify(wfDef), function (err, result) {
    if (err) callback(err)
    callback(null, result)
  })
}

module.exports = {
  redisWFInst: redisWFInst,
  instanceNumber: instanceNumber,
  newInst: newInst,
  updateInst: updateInst,
  logInst: logInst
}
