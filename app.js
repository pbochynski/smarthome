
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var apiConsole = require('./modules/api-console');

// END OF METRICS CONFIGURATION

var regulatorEndpoint = require('./routes/regulator-endpoint');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));
//app.use(basicAuth);

app.use(regulatorEndpoint);

apiConsole.addRoutesTo(app);


module.exports = app;
