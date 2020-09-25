// flow actions/activities/functions examples to be implemented in it's own module and imported here
const JSONPath = require('jsonpath');
const jsonLogic = require('json-logic-js');
const Queue = require('bull');
const keys = require('./config/keys');
const QUEUE_NAME = "FLOW";
const REDIS_URL = keys.redisURL;
const flowQueue = new Queue(QUEUE_NAME, REDIS_URL);
const moment = require('moment');

const doFunction = (job, node) => {
  new Promise(res => setTimeout(res, 100))
};

var level = 0;
var currentNode = {};

//exec first node and continue recurse
var exec1 = async (job, actions, def) => {
  if (actions.length > 0) {
    const first = actions.shift();

    if (first.type == "logic") {
      switch (first.name) {
        case "IF_ELSE":
          level=level+1;
          currentNode = {...first};
          job.log(`Start branch: ${first.title}`)
          if (jsonLogic.apply(first.rules, def[first.data])) {
            await exec1(job, JSONPath.query(first, '$..branches[?(@.condition==true)].actions')[0], def)
          } else {
            await exec1(job, JSONPath.query(first, '$..branches[?(@.condition==false)].actions')[0], def)
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
      await doFunction(job, first)
     
      
      //finish doing task..
      loginst = (moment().format()) + `: Ended ${first.name}, ${first.title}`;
      console.log(actions.length, loginst);
      job.log(loginst);

      
    }
    exec1(job, actions, def);
    
    //return "Active";
  } else {
    if (level < 1) {
      job.log("Workflow completed")
    } else {
      job.log(`Exit branch: ${currentNode.title}`);
      level = level -1;
    };
    //return "Completed";
  }
}

var startflow = (job) => {

  exec1(job, job.data.definition.actions, job.data.definition);
}

module.exports = {
  startflow: startflow
}
