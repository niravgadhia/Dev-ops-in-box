'use strict';

// IMPORTANT: this flag removes *all* SSL validation in the REST API the server here.
// TODO: replace this with a CA fix?
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');
const rp = require('request-promise');
const dbTables = ['metrics', 'okr', 'users', 'code_commits','deployments', 'failed_deployments','ram']
/* For gitlab project import: */
const request = require('request');
const fs = require('fs');

//
// Constants
//
const SECURE_PROTOCOL = 'https://';
const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

const STATUS_OK = 200;
const STATUS_BAD_REQUEST = 400;
const STATUS_ERROR = 500;
const STATUS_UNAVAILABLE = 503;

//
// DB
//
const clientConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_USER_PASSWORD,
  port: process.env.DB_PORT || 5432,
};
console.log(clientConfig);

let dbReady = false;
let client;

let rcAuthData = {};
let rcRoomIds = {};

//
// APP
//
const app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


//
// UTILITIES
//
function connect() {
  
  client = new Client(clientConfig);

  client.connect((err) => {

    if (err) {
      console.error('connection error', err.stack)
      console.log('trying again in 10 seconds..')      
      
      try {
        client.end();
        client = null;
      } catch { }

      setTimeout(connect, 10 /* seconds */ * 1000 /* to MS */);

    }
    else {
      dbReady = true;
      console.log('connected');
      client.query('SELECT NOW()', (err, res) => {
        console.log(err, res);
      });
    }
  });
}

// Exit the process cleanly
function cleanUp() {
  if (client) {
    client.end();
  }
}


// Execute SQL insert statement
function performInsert(response, sql, values) {
  console.log(`SQL: ${sql}`);
  console.log(values);

  client.query(sql, values)
    .then((result) => {
      console.log(result);
      response.status(STATUS_OK).send();
    })
    .catch((e) => {
      console.log(JSON.stringify(e));
      console.error(e.stack);
      response.status(STATUS_ERROR).send('An error occurred');
    });
}

// Execute SQL Delete statement
function performReset(sql, response) {
  console.log(`SQL: ${sql}`);
  //console.log(values);

  client.query(sql)
    .then((result) => {
      console.log(result);
      response.sendStatus(STATUS_OK);
    })
    .catch((e) => {
      console.error(e.stack);
      response.status(STATUS_ERROR).send('An error occurred');
    });
}

// Clear Database

function resetDb(table, response) {
      const sql = `DELETE FROM ${table}`;
      performReset(sql, response);
}


// Configure SQL insert statement
//metric/:metricName
//prepareInsert('metrics', 'metric_name', 'metric_value', 'metricName', req, res);
function prepareInsert(table, nameField, valueField, valueParam, req, res) {
  if (dbReady) {
    const name = req.params[valueParam];
    const value = req.body.value;
    const ago = req.body.ago;
    const delay = req.body.delay || 0;
    const sqlParams = [name, value];
    let time = 'now()';

    console.log('Ago: ');
    console.log(ago);

    if (ago) {
      time = `now() - interval '${ago}'`;
    }

    if (value || value === 0) { // Allow any truthy value and literal zeroes
      const sql = `INSERT INTO ${table} (${nameField}, ${valueField}, report_date) VALUES ($1, $2, ${time})`;
      setTimeout(() => {
        performInsert(res, sql, sqlParams);
      }, delay);
      
    }
    else { // A value wasn't provided
      res.sendStatus(STATUS_BAD_REQUEST);
    }
  }
  else { // DB isn't connected
    res.sendStatus(STATUS_UNAVAILABLE)
  }
}

// returns promise
function getRocketChatAuth(baseUrl, userId) {

  userId = userId || 'devops.admin';

  let promise = new Promise((resolve, reject) => {

    if(rcAuthData[userId]) {
      resolve(rcAuthData[userId]);
    } else {
      let options = {
        method: 'POST',
        uri: baseUrl + '/rocketchat/api/v1/login',
        body: {
            user: userId,
            password: 'P@ssw0rd'
        },
        json: true // Automatically stringifies the body to JSON
      };

      rp(options).then(result => {
        rcAuthData[userId] = {
          "authToken": result.data.authToken,
          "userId": result.data.userId,        
        };
        
        resolve(rcAuthData[userId]);
      }).catch(err => {
        
        console.log(JSON.stringify(err));        
        
        reject(err);
      });
    }

  });

  return promise;
}

//
// ENDPOINTS
//

app.all(['/alive', '/demo-api/alive'], (req, res) => {  
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'GET, OPTIONS'});
  res.send('Alive\n');
});

// Add metric value to database
//
// URL Format: <host>:<port>/metric/<metric_name>
//
//  Verb: POST
//  Encoding: application/x-www-form-urlencoded
//  Body:
//    "value"   Numeric   (Required) -- The value of the metric to store
//    "ago"     String    [Optional] -- A string in Postgres' "interval" format, see: https://www.postgresql.org/docs/9.6/functions-datetime.html
//
// Examples using `curl`.
// curl -d "value=5" -X POST localhost:8080/metric/instances
// curl -d "value=3" -X POST grafana-datasource-rest:8080/metric/instances
// curl -d "value=3&ago=1+minute" -X POST grafana-datasource-rest:8080/metric/instances
// curl -d "value=7&ago=1+hour" -X POST grafana-datasource-rest:8080/metric/instances
// curl -d "value=42&ago=1+week" -X POST grafana-datasource-rest:8080/metric/other
app.all(['/reset/:resetName', '/demo-api/reset/:resetName'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    dbTables.forEach(name =>{
      resetDb(name, res);
    })
  } else {    
   res.status(STATUS_OK).send('ok');
  };   
});


app.all(['/seed-data', '/demo-api/seed-data'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {

    const delay = req.body ? req.body.delay || 0 : 0;

    setTimeout(() => {

      // performInsert(`INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ('instances', 1, now() - interval '1 hour')`);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '2 hour')`, ['instances', 2]);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '3 hour')`, ['instances', 3]);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '4 hour')`, ['instances', 2]);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '5 hour')`, ['instances', 2]);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '6 hour')`, ['instances', 3]);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '7 hour')`, ['instances', 2]);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '8 hour')`, ['instances', 2]);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '9 hour')`, ['instances', 2]);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '10 hour')`, ['instances', 2]);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '11 hour')`, ['instances', 1]);
      performInsert(res, `INSERT INTO metrics (metric_name, metric_value, report_date) VALUES ($1, $2, now() - interval '12 hour')`, ['instances', 2]);

      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '1 week')`, [ 'sales_improvement', 55 ]);
      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '2 week')`, ['sales_improvement', 52]);
      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '3 week')`, ['sales_improvement', 54]);
      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '4 week')`, ['sales_improvement', 50]);
      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '5 week')`, ['sales_improvement', 48]);
      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '6 week')`, ['sales_improvement', 43]);
      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '7 week')`, ['sales_improvement', 42]);
      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '8 week')`, ['sales_improvement', 46]);
      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '9 week')`, ['sales_improvement', 38]);
      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '10 week')`, ['sales_improvement', 37]);
      performInsert(res, ` INSERT INTO okr (okr_name, okr_value, report_date) VALUES ($1, $2, now() - interval '11 week')`, ['sales_improvement', 38]);

      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '1 week')`, ['user_count', 52]);
      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '2 week')`, ['user_count', 54]);
      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '3 week')`, ['user_count', 50]);
      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '4 week')`, ['user_count', 48]);
      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '5 week')`, ['user_count', 43]);
      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '6 week')`, ['user_count', 42]);
      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '7 week')`, ['user_count', 46]);
      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '8 week')`, ['user_count', 38]);
      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '9 week')`, ['user_count', 36]);
      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '10 week')`, ['user_count', 41]);
      performInsert(res, ` INSERT INTO users (users_name, users_value, report_date) VALUES ($1, $2, now() - interval '11 week')`, ['user_count', 39]);

      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '1 week')`, ['commits', 1]);
      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '2 week')`, ['commits', 2]);
      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '3 week')`, ['commits', 3]);
      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '4 week')`, ['commits', 1]);
      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '5 week')`, ['commits', 1]);
      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '6 week')`, ['commits', 2]);
      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '7 week')`, ['commits', 4]);
      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '8 week')`, ['commits', 3]);
      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '9 week')`, ['commits', 1]);
      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '10 week')`, ['commits', 3]);
      performInsert(res, ` INSERT INTO code_commits (commit_name, commit_value, report_date) VALUES ($1, $2, now() - interval '11 week')`, ['commits', 2]);

      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '1 week')`, ['deployments', 1]);
      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '2 week')`, ['deployments', 3]);
      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '3 week')`, ['deployments', 4]);
      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '4 week')`, ['deployments', 2]);
      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '5 week')`, ['deployments', 1]);
      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '6 week')`, ['deployments', 3]);
      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '7 week')`, ['deployments', 4]);
      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '8 week')`, ['deployments', 5]);
      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '9 week')`, ['deployments', 1]);
      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '10 week')`, ['deployments', 3]);
      performInsert(res, ` INSERT INTO deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '11 week')`, ['deployments', 2]);

      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '1 week')`, ['failed_deployments', 0.75]);
      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '2 week')`, ['failed_deployments', 1]);
      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '3 week')`, ['failed_deployments', 2]);
      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '4 week')`, ['failed_deployments', 0.5]);
      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '5 week')`, ['failed_deployments', 1]);
      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '6 week')`, ['failed_deployments', 1]);
      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '7 week')`, ['failed_deployments', 3]);
      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '8 week')`, ['failed_deployments', 2]);
      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '9 week')`, ['failed_deployments', 1]);
      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '10 week')`, ['failed_deployments', 4]);
      performInsert(res, ` INSERT INTO failed_deployments (deployment_name, deployment_value, report_date) VALUES ($1, $2, now() - interval '11 week')`, ['failed_deployments', 2]);

      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '1 hour')`, ['ram_usage', 0.7]);
      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '2 hour')`, ['ram_usage', 0.2]);
      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '3 hour')`, ['ram_usage', 0.3]);
      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '4 hour')`, ['ram_usage', 0.4]);
      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '5 hour')`, ['ram_usage', 0.5]);
      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '6 hour')`, ['ram_usage', 0.6]);
      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '7 hour')`, ['ram_usage', 0.1]);
      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '8 hour')`, ['ram_usage', 0.3]);
      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '9 hour')`, ['ram_usage', 0.8]);
      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '10 hour')`, ['ram_usage', 0.2]);
      performInsert(res, ` INSERT INTO ram (ram_name, ram_value, report_date) VALUES ($1, $2, now() - interval '11 hour')`, ['ram_usage', 0.4]);

    }, delay);

  } else {    
   res.status(STATUS_OK).send('ok');
  };   
});

app.all(['/metric/:metricName', '/demo-api/metric/:metricName'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});
  
  if(req.method === 'POST') {
    prepareInsert('metrics', 'metric_name', 'metric_value', 'metricName', req, res);
  } else {    
   res.status(STATUS_OK).send('ok');
  }
});

// Add OKR value to database
//
// URL Format: <host>:<port>/okr/<okr_name>
//
//  Verb: POST
//  Encoding: application/x-www-form-urlencoded
//  Body:
//    "value"   Numeric   (Required) -- The value of the metric to store
//    "ago"     String    [Optional] -- A string in Postgres' "interval" format, see: https://www.postgresql.org/docs/9.6/functions-datetime.html
//
// Examples using `curl`.
// curl -d "value=5" -X POST localhost:8080/okr/sales_improvement
// curl -d "value=3" -X POST grafana-datasource-rest:8080/okr/sales_improvement
// curl -d "value=3&ago=1+minute" -X POST grafana-datasource-rest:8080/okr/sales_improvement
// curl -d "value=7&ago=1+hour" -X POST grafana-datasource-rest:8080/okr/sales_improvement
// curl -d "value=42&ago=1+week" -X POST grafana-datasource-rest:8080/okr/other
app.all(['/okr/:okrName', '/demo-api/okr/:okrName'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    prepareInsert('okr', 'okr_name', 'okr_value', 'okrName', req, res);
  } else {
    res.status(STATUS_OK).send('ok');
  }
});

app.all(['/users/:usersName', '/demo-api/users/:usersName'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    prepareInsert('users', 'users_name', 'users_value', 'userName', req, res);
  } else {
    res.status(STATUS_OK).send('ok');
  }
});

app.all(['/code_commits/:code_commitsName', '/demo-api/code_commits/:code_commitsName'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});
  
  if(req.method === 'POST') {
    
    prepareInsert('code_commits', 'commit_name', 'commit_value', 'commit_date', req, res);
  } else {
    res.status(STATUS_OK).send('ok');
  }
});

app.all(['/deployments/:deploymentsName', '/demo-api/deployments/:deploymentsName'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    prepareInsert('deployments', 'deployment_name', 'deployment_value', 'deployment_date', req, res);
  } else {
    res.status(STATUS_OK).send('ok');
  }
});

app.all(['/failed_deployments/:failed_deploymentsName', '/demo-api/failed_deployments/:failed_deploymentsName'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    prepareInsert('failed_deployments', 'deployment_name', 'deployment_value', 'deployment_date', req, res);
  } else {
    res.status(STATUS_OK).send('ok');
  }
});

app.all(['/ram/:ramName', '/demo-api/ram/:ramName'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    prepareInsert('ram', 'ram_name', 'ram_value', 'ramName', req, res);
  } else {
    res.status(STATUS_OK).send('ok');
  }
});

// sh '''
// curl ''' + BASEURL + '''rocketchat/api/v1/login -d "user=devops.system&password=P@ssw0rd" > rocket_token.json
// user=$(sed 's/{"status":"success","data":{//' rocket_token.json | cut -d , -f 1 | cut -d : -f 2  | sed 's/"//g')
// token=$(sed 's/{"status":"success","data":{//' rocket_token.json | cut -d , -f 2 | cut -d : -f 2  | sed 's/"//g')

// curl -H "X-Auth-Token: $token" \
//     -H "X-User-Id: $user" \
//     -H "Content-type:application/json" \
//     ''' + BASEURL + '''rocketchat/api/v1/chat.postMessage \
//     -d '{ "channel": "#general", "text": "Jenkins pipeline starting for ''' + REPO_SUFFIX + '''" }'
app.all(['/chat/post/:target', '/demo-api/chat/post/:target'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    console.log('send message to: ' + req.params['target']);
    
    let baseUrl = SECURE_PROTOCOL + req.hostname;
    let userId = req.body ? req.body.userId : null;
    
    // get auth token
    getRocketChatAuth(baseUrl, userId).then(authData => {

      let delay = parseInt(req.body.delay || "0")      

      let opt = {
        method: 'POST',
        uri: baseUrl + '/rocketchat/api/v1/chat.postMessage',
        headers: {
          'X-Auth-Token': authData.authToken,
          'X-User-Id': authData.userId,
          'Content-type': 'application/json'
        },
        body: {
          channel: req.params['target'],
          text: req.body.message
        },
        json: true
      };

      setTimeout(function() {
        rp(opt).then(d => {        
          res.status(STATUS_OK).send('message sent to: ' + req.params['target']);
        }).catch(e => {        
          res.status(STATUS_ERROR).send('error sending message to: ' + req.params['target'] + ': ' + e);
        });  
      }, delay);

    }).catch(err => {      
      res.status(STATUS_ERROR).send('error getting auth token: ' + JSON.stringify(err));
    });
  
    
  } else {
    res.status(STATUS_OK).send('ok');
  }
});

// user join a channel
app.all(['/chat/join/:target', '/demo-api/chat/join/:target'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    
    let baseUrl = SECURE_PROTOCOL + req.hostname;
    let roomName = req.params['target'];
    let userId = req.body ? req.body.userId : null;
    
    // get auth token
    getRocketChatAuth(baseUrl, userId).then(authData => {

      let opt = {
        method: 'POST',
        uri: baseUrl + '/rocketchat/api/v1/channels.join',
        headers: {
          'X-Auth-Token': authData.authToken,
          'X-User-Id': authData.userId,
          'Content-type': 'application/json'
        },
        body: {
          roomId: roomName,
          joinCode: req.body && req.body.joinCode ? req.body.joinCode : ''
        },
        json: true
      };

      rp(opt).then(d => {        
        res.status(STATUS_OK).send(`${userId} joined channel ${roomName}`);
      }).catch(e => {        
        res.status(STATUS_ERROR).send(`Error with ${userId} joining channel ${roomName}`);
      });  

    }).catch(err => {      
      res.status(STATUS_ERROR).send('error getting auth token: ' + JSON.stringify(err));
    });
  
    
  } else {
    res.status(STATUS_OK).send('ok');
  }
});

// update a setting
app.all(['/chat/settings/:setting', '/demo-api/chat/settings/:setting'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    
    let baseUrl = SECURE_PROTOCOL + req.hostname;

    let settingName = req.params['setting'];
    let settingValue = req.body.value;

    // get auth token
    getRocketChatAuth(baseUrl, 'devops.admin').then(authData => {

      let opt = {
        method: 'POST',
        uri: baseUrl + '/rocketchat/api/v1/settings/' + settingName,
        headers: {
          'X-Auth-Token': authData.authToken,
          'X-User-Id': authData.userId,
          'Content-type': 'application/json'
        },
        body: {
          value: settingValue
        },
        json: true
      };

      rp(opt).then(d => {
        res.status(STATUS_OK).send('Setting updated: ' + settingName);
      }).catch(e => {
        res.status(STATUS_ERROR).send('Error updating setting ' + settingName + '; ' + JSON.stringify(e));
      });

    }).catch(err => {
      res.status(STATUS_ERROR).send('error getting auth token: ' + JSON.stringify(err));
    });

  } else {
    res.status(STATUS_OK).send('ok');
  }
});

// register a user
app.all(['/chat/register', '/demo-api/chat/register'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    
    let baseUrl = SECURE_PROTOCOL + req.hostname;

    let userName = req.body.userName;
    let userFullName = req.body.userFullName;

    let delay = req.body.delay || 0;
    
    let opt = {
      method: 'POST',
      uri: baseUrl + '/rocketchat/api/v1/users.register',
      headers: {
        'Content-type': 'application/json'
      },
      body: {
        username: userName,
        email: userName + '@local',
        pass: 'P@ssw0rd',
        name: userFullName
      },
      json: true
    };
    
    setTimeout(() => {
      rp(opt).then(d => {      
        res.status(STATUS_OK).send('user registered: ' + userName);
      }).catch(e => {
        let msg = JSON.stringify(e);
        if(msg.indexOf('already exists') === -1) {
          res.status(STATUS_ERROR).send('Error registering user ' + userName + '; ' + msg);
        } else {
          res.status(STATUS_OK).send('User not registered: already exists');
        }
      });
    }, delay);

  } else {
    res.status(STATUS_OK).send('ok');
  }
});

// create a channel
app.all(['/chat/create-channel', '/demo-api/chat/create-channel'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    
    let baseUrl = SECURE_PROTOCOL + req.hostname;

    // get auth token
    getRocketChatAuth(baseUrl, 'devops.admin').then(authData => {

      let opt = {
        method: 'POST',
        uri: baseUrl + '/rocketchat/api/v1/channels.create',
        headers: {
          'X-Auth-Token': authData.authToken,
          'X-User-Id': authData.userId,
          'Content-type': 'application/json'
        },
        body: {
          name: req.body.roomName,
          members: req.body.members,
          readOnly: false
        },
        json: true
      };

      rp(opt).then(d => {
        res.status(STATUS_OK).send('Channel created: ' + req.body.roomName);
      }).catch(e => {
        res.status(STATUS_ERROR).send('Error creating channel ' + req.body.roomName + '; ' + JSON.stringify(e));
      });

    }).catch(err => {
      res.status(STATUS_ERROR).send('error getting auth token: ' + JSON.stringify(err));
    });

  } else {
    res.status(STATUS_OK).send('ok');
  }
});

// delete a channel
app.all(['/chat/delete-channel', '/demo-api/chat/delete-channel'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    
    let baseUrl = SECURE_PROTOCOL + req.hostname;

    // get auth token
    getRocketChatAuth(baseUrl, 'devops.admin').then(authData => {

      let opt = {
        method: 'POST',
        uri: baseUrl + '/rocketchat/api/v1/channels.delete',
        headers: {
          'X-Auth-Token': authData.authToken,
          'X-User-Id': authData.userId,
          'Content-type': 'application/json'
        },
        body: {
          roomName: req.body.roomName
        },
        json: true
      };

      rp(opt).then(d => {
        res.status(STATUS_OK).send('Channel deleted: ' + req.body.roomName);
      }).catch(e => {
        res.status(STATUS_ERROR).send('Error deleting channel ' + req.body.roomName + '; ' + JSON.stringify(e));
      });

    }).catch(err => {
      res.status(STATUS_ERROR).send('error getting auth token: ' + JSON.stringify(err));
    });

  } else {
    res.status(STATUS_OK).send('ok');
  }
});

// reset a channel (delete / create)
app.all(['/chat/reset-channel', '/demo-api/chat/reset-channel'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  if(req.method === 'POST') {
    
    let baseUrl = SECURE_PROTOCOL + req.hostname;

    let roomName = req.body.roomName;
    let members = req.body.members;

    // get auth token
    getRocketChatAuth(baseUrl, 'devops.admin').then(authData => {

      let opt = {
        method: 'POST',
        uri: baseUrl + '/rocketchat/api/v1/channels.delete',
        headers: {
          'X-Auth-Token': authData.authToken,
          'X-User-Id': authData.userId,
          'Content-type': 'application/json'
        },
        body: {
          roomName: roomName
        },
        json: true
      };

      rp(opt).then(d => {
        console.log('Channel deleted: ' + roomName);
      }).catch(e => {
        let msg = JSON.stringify(e);
        // don't log error if it's just can't delete non-existing room
        if(msg.indexOf('error-room-not-found') === -1) {
          console.log('Error deleting channel ' + roomName + '; ' + msg);
        }
      }).finally(() => {

        let opt = {
          method: 'POST',
          uri: baseUrl + '/rocketchat/api/v1/channels.create',
          headers: {
            'X-Auth-Token': authData.authToken,
            'X-User-Id': authData.userId,
            'Content-type': 'application/json'
          },
          body: {
            name: roomName,
            members: members,
            readOnly: false
          },
          json: true
        };
  
        rp(opt).then(d => {
          res.status(STATUS_OK).send('Channel reset: ' + roomName);
        }).catch(e => {
          res.status(STATUS_ERROR).send('Error resetting channel ' + roomName + '; ' + JSON.stringify(e));
        });

      });

    }).catch(err => {
      res.status(STATUS_ERROR).send('error getting auth token: ' + JSON.stringify(err));
    });

  } else {
    res.status(STATUS_OK).send('ok');
  }
});

// gitlab
app.all(['/git/:apiToken', '/demo-api/git/:apiToken'], (req, res) => {
  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS'});

  
  if(req.method === 'OPTIONS') {

    res.status(STATUS_OK).send('ok');

  } else {
    
    let baseUrl = SECURE_PROTOCOL + req.hostname;
    let apiToken = req.params['apiToken'];

    let opt = {
      method: req.method,
      uri: baseUrl + '/gitlab/api/v4/' + req.query.path,
      headers: {
        'Private-Token': apiToken
      }
    };

    if(req.method === 'POST' || req.method === 'PUT') {
      opt.headers['Content-type'] = 'application/json';
      opt.body = req.body;
      opt.json = true;
    }

    rp(opt).then(d => {
      res.status(STATUS_OK).send(d);
    }).catch(e => {
      res.status(STATUS_ERROR).send('Gitlab API error ' + req.query.path + '; ' + JSON.stringify(e));
    });

  }

});

app.all(['/git/:apiToken/import/:namespace/:projectPath', '/demo-api/git/:apiToken/import/:namespace/:projectPath'], (req, res) => {

  console.log('Begin git import');

  res.set({'Access-Control-Allow-Origin': '*'});
  res.set({'Access-Control-Allow-Methods': 'POST, OPTIONS'});

  
  if(req.method === 'OPTIONS') {

    res.status(STATUS_OK).send('ok');

  } else {
    
    let baseUrl = SECURE_PROTOCOL + req.hostname;    
    let apiToken = req.params['apiToken'];
    let url = baseUrl + '/gitlab/api/v4/projects/import';

    let namespace = req.params['namespace'];
    let projectPath = req.params['projectPath'];
    let filePath = req.body.file;

    // first remove project if it already exists
    let getOpt = {
      method: 'GET',
      uri: baseUrl + '/gitlab/api/v4/projects?simple=true',
      headers: {
        'Private-Token': apiToken
      }
    };

    rp(getOpt).then(data => {
      
      let plist = JSON.parse(data);
      let existing =plist.find(p => p.name === projectPath);

      if(existing) {

        console.log('Delete existing git data');

        let delOpt = {
          method: 'DELETE',
          uri: baseUrl + '/gitlab/api/v4/projects/' + existing.id,
          headers: {
            'Private-Token': apiToken
          }
        }

        rp(delOpt).then(() => {
          // wait a few seconds for the project to delete before trying to create with same name.
          setTimeout(getImportData, 10000);
        }).catch(e => {
          res.status(STATUS_ERROR).send('Error deleting project: ' + JSON.stringify(e));
        });

      } else {
        getImportData();
      }
    }).catch(e => {
      console.log('error getting projects..');
      console.log(e);
      res.status(STATUS_ERROR).send('Error getting projects: ' + JSON.stringify(e));
    });

    function getImportData() {

      console.log('Begin getImportData: ' + filePath);

      // pull the file from its GCP bucket
      let options = {
        url: filePath,
        encoding: null
      };

      request.get(options, function (e, httpResponse, body) {
        if (e) {
          console.log('error retrieving file.');
          console.log(e);
          res.status(STATUS_ERROR).send('Error retrieving file: ' + JSON.stringify(e));
        } else {
          postToGitlab(body);
        }
      });      
    } 
    
    function postToGitlab(importBuffer) {

      console.log('Inside postToGitlab: ' + importBuffer.length);

      const formData = {
        namespace: namespace,
        path: projectPath,
        file: {
          value: importBuffer,
          options: {
            filename: filePath
          }
        }
      };
  
      const headers = {
        'Private-Token': apiToken
      };
  
      request.post({url: url, headers: headers, formData: formData}, function optionalCallback(err, httpResponse, body) {
        if (err) {
          res.status(STATUS_ERROR).send(JSON.stringify(err));
        } else {
          res.status(STATUS_OK).send(body);
        }
      });
    }
  }
});

//
// FINAL SETUP
//

// Listen for end
process.on('exit', cleanUp);

// Start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
setTimeout(connect, 10 /* seconds */ * 1000 /* to MS */);