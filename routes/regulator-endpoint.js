var express = require('express');
var regulator = require('../modules/regulator');


function regulatorUpdate(req, res) {
    regulator.update(req.headers['hybris-tenant'] || 'pihome',req.query).then(function () {
        res.end()
    });
}
function regulatorGet(req, res) {
    regulator.get(req.headers['hybris-tenant'] || 'pihome').then(function (doc) {
        delete doc['_id'];
        res.json(doc);
    });
}
function metrics(req, res) {
    regulator.metrics(req.headers['hybris-tenant'] || 'pihome').then(function (doc) {
        res.json(doc);
    });
}

function heater(req, res) {
    regulator.heater(req.query.api_key).then(function (response) {
        res.set('Content-Type', 'text/html');
        res.status(200);
        res.send(response.toString());
    });
}


function metric(req,res) {
    regulator.metric(req.query.api_key, req.body).then(function () {
        res.sendStatus(200);
    }).catch(function (err, result) {
        res.sendStatus(500)
    });

}

var router = express.Router();
router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

function newAlias(req,res) {
    regulator.newAlias(req.headers['hybris-tenant'] || 'pihome', req.body.chipId, req.body.name);
    res.sendStatus(201);

}
function allAliases(req,res) {
    regulator.allAliases(req.headers['hybris-tenant'] || 'pihome').then(function (doc) {
        res.json(doc);
    });

}

router.post('/aliases', newAlias);
router.get('/aliases', allAliases);

router.post('/regulator', regulatorUpdate);
router.get('/regulator', regulatorGet);
router.get('/heater', heater);
router.post('/metrics', metric);
router.get('/metrics', metrics);
module.exports = router;
