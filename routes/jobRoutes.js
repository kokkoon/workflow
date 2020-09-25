const JSONPath = require("jsonpath");
const express = require("express");
const bodyParser = require("body-parser");
const URL = require('url');
const router = express.Router();
const Queue = require("bull");
const GUI = require('bull-arena');
const QUEUE_NAME= 'FLOW';
const keys = require('../config/keys');
const flowQueue = new Queue(QUEUE_NAME, keys.redisURL);
const redisqueries = require('../middlewares/redisqueries');

const queueDashboard = GUI({
	queues: [
		{
			name: QUEUE_NAME,
			hostId: "flow",
			url: keys.redisURL 
		},
		{
			name: "MESSAGE",
			hostId: "flow",
			url: keys.redisURL 
		}
	]
}, {
	basePath: "/",
	disableListen: true
});


module.exports = app => {
  router.use('/', queueDashboard)
  app.use('/queue_dashboard', router);
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  /**
   * POST a new ochestration
   */
  app.post('/orchestration', function(req, res) {
	  const jobDefinition = req.body;
	  console.log("req.body:", jobDefinition)
	  flowQueue.add(jobDefinition)
	  	.then(result => {
			console.log("result:", result)
			console.log("jobState:", result.getState())
			res.send(result, "jobState:", result.getState())
		  }, error => {
			console.log("error:", error)
			res.send(error)
		  })
		.catch(alert => {
			console.log("alert:", alert)
			res.send(alert)
		})

  })

  app.get('/orchestration/:id', function(req, res) {
	console.log(req.params.id)
	flowQueue.getJob(req.params.id)
		.then(job => {
			console.log("result:", job)
			job.getState()
				.then(result => {
					console.log("jobState:", result)
				})
				.catch(alert => {
					console.log("alert:", alert)
				})
				res.send(job)
			}, error => {
				console.log("(ops!)error:", error)
				res.send(error)
			})
		.catch(alert => {
			console.log("alert:", alert)
			res.send(alert)
		})
  })

  app.get('/logs/:jobId', function(req, res) {
	const jobId = req.params.jobId;
	const url = URL.parse(req.url, true);
	const start = url.query.start? url.query.start : 0;
	const end = url.query.end? url.query.end : 20;
	  flowQueue.getJobLogs(jobId, start, end)
	  	.then(logs => {
			  console.log(`jobLogs(${jobId}?${start}&${end}):`, logs)
			  res.send(logs);
		  }, error => {
			console.log("(ops!)error:", error)
			res.send(error)
		  })
		.catch(alert => {
			console.log("(ops!)alert:", alert);
			res.send(alert);
		})
  })



	app.get('/startflow', function(req, res) {
		const url = URL.parse(req.url, true)
		const id = url.query.id
		//res.send(wfDBO.getWFByID(id))

        //wfDBO.getWorkflowByID(id, function(item) {
        //        flowrunner.startflow(id, item, ()=>{res.send(item)})
        //})

	})

}
