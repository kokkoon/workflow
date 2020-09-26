const keys = require('./config/keys');
const redisqueries = require('./middlewares/redisqueries');
const Queue = require("bull");
const QUEUE_NAME= 'FLOW';
const REDIS_URL= keys.redisURL; //'redis://h:zwWbvx0uyH2ZYceqMAUzeHXm8u90ROnK@redis-13053.c1.asia-northeast1-1.gce.cloud.redislabs.com:13053'
const flowQueue = new Queue(QUEUE_NAME, REDIS_URL);
const flowrunner = require('./flowrunner');

flowQueue.process(function(job, done) {
  console.log(job.data)
  job.log((job.data.state && job.data.state=="Paused")? "Resuming workflow...": "Starting workflow...")
  flowrunner.startflow(job)
  //job.moveToCompleted("stopped", true)
  done();
});
