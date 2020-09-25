// flow actions/activities/functions examples to be implemented in it's own module and imported here
const JSONPath = require('jsonpath');
const jsonLogic = require('json-logic-js');
const Queue = require('bull');
const keys = require('./config/keys');
const QUEUE_NAME = "FLOW";
const REDIS_URL = keys.redisURL;
const flowQueue = new Queue(QUEUE_NAME, REDIS_URL);
const moment = require('moment');


//exec first node and continue recurse
var exec1 = (job, actions, def) => {
  if (actions.length > 0) {
    const first = actions.shift();

    if (first.type == "logic") {
      switch (first.name) {
        case "IF_ELSE":
          if (jsonLogic.apply(first.rules, def[first.data])) {
            exec1(job, JSONPath.query(first, '$..branches[?(@.condition==true)].actions')[0], def)
          } else {
            exec1(job, JSONPath.query(first, '$..branches[?(@.condition==false)].actions')[0], def)
          }
          break
        case "IF_TRUE":
          break
        case "WHILE":
          break
        default:
          break
      }
    } else {
      // start executing task
      var loginst = (moment().format()) + `: Started ${first.name}, ${first.title}`;
      console.log(actions.length, loginst);
      job.log(loginst);

      // do task execution
      setTimeout(() => {
        //finish doing task..
        loginst = (moment().format()) + `: Ended ${first.name}, ${first.title}`;
        console.log(actions.length, loginst);
        job.log(loginst);
      }, 200)

      
    }
    exec1(job, actions, def);
    
    //return "Active";
  } else {
    job.log("Workflow completed");
    //return "Completed";
  }
}

var startflow = (job) => {

  exec1(job, job.data.definition.actions, job.data.definition);
}

module.exports = {
  startflow: startflow
}
