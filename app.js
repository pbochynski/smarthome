
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var basicAuth = require('express-basic-auth');


var apiConsole = require('./modules/api-console');


var regulatorEndpoint = require('./routes/regulator-endpoint');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

apiConsole.addRoutesTo(app);

function envUsers(){
    var users = {};
    users[process.env.BASIC_USER] = process.env.BASIC_PASS;
    return users;
}
app.use(basicAuth({users:envUsers(), challenge: true}));


app.use(regulatorEndpoint);

module.exports = app;
