
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var apiConsole = require('./modules/api-console');


var regulatorEndpoint = require('./routes/regulator-endpoint');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

apiConsole.addRoutesTo(app);

app.use(regulatorEndpoint);

module.exports = app;
