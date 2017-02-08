
var express = require('express');
var basicAuth = require('express-basic-auth');
var bodyParser = require('body-parser');
var path = require('path');

var apiConsole = require('./modules/api-console');


var regulatorEndpoint = require('./routes/regulator-endpoint');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

function envUsers(){
    var users = {};
    users[process.env.BASIC_USER] = process.env.BASIC_PASS;
    return users;
}
app.use(basicAuth({users:envUsers(), challenge: true}));

app.use(regulatorEndpoint);

apiConsole.addRoutesTo(app);


module.exports = app;
