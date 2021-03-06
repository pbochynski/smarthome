exports.update = update;
exports.get = get;
exports.heater = heater;
exports.connect = connect;
exports.disconnect = disconnect;
exports.metric = metric;
exports.metrics = metrics;
exports.newAlias = newAlias;
exports.allAliases = allAliases;
exports.stats = stats;

var MongoClient = require('mongodb').MongoClient

var Aggregator = require('./aggregator');

var url = 'mongodb://localhost:27017/smarthome';
if (process.env.MONGO_URL) {
    url = process.env.MONGO_URL;
}
var mongoDb;
var connected = false;
// Connect using MongoClient

function disconnect() {
    mongoDb.close(true);
}
function connect(done) {
    if (connected) {
        done();
        return;
    }
    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw err;
        }
        if (mongoDb==null) {
            mongoDb = db;
        } else {
            db.close(true);
        }
        setConfig({key: "test", tenant: "test"})
            .then(_ => {
                conncted = true;
                if (done) {
                    done();
                }
            });

    });

}
connect();

function setConfig(params) {

    var values = {
        tenant: params.tenant,
        channel: params.channel
    };
    return mongoDb.collection("keys").updateOne({
        _id: params.key,
        tenant: params.tenant
    }, {"$set": values}, {upsert: true});
}

function getConfig(key) {
    return mongoDb.collection("keys").findOne({_id: key});
}

function update(tenant, params) {
    var values = {state: params.state};
    if (params.state == "auto") {
        if (params.temperature) {
            values.temperature = Number(params.temperature);
        }
        if (params.deviation) {
            values.deviation = Number(params.deviation);
        }
        if (params.sensor) {
            values.sensor = params.sensor;
        }
    }
    if (params.state == 'on') {
        values.heater = 1;
    }
    if (params.state == 'off') {
        values.heater = 0;
    }

    return mongoDb.collection("regulator").updateOne({_id: tenant}, {"$set": values}, {upsert: true})
}

function get(tenant) {
    return mongoDb.collection("regulator").findOne({_id: tenant});
}

function heater(apiKey) {
    return getConfig(apiKey).then(heaterWithCongig);
}


function heaterWithCongig(config) {
    return new Promise(function (resolve, reject) {
        Promise.all([get(config.tenant), metrics(config.tenant)]).then(values => {
            var regulator = values[0];
            var sensors = values[1];
            var field = regulator.sensor || "field2";
            var temperature = Number(sensors.filter(function (sensor) {
                return sensor.chipId == field
            })[0].t);
            var response = regulator.heater || 0;
            if (regulator.state == 'auto') {
                if (temperature < regulator.temperature - regulator.deviation) {
                    response = 1;
                } else if (temperature > regulator.temperature + regulator.deviation) {
                    response = 0;
                }
                if (response != regulator.heater) {
                    mongoDb.collection("regulator").updateOne({_id: config.tenant}, {"$set": {heater: response}}, {upsert: true});
                }
            }
            resolve(response);
        });
    });
}

function metric(key, data) {
    return getConfig(key).then(function (config) {
        var value = {
            tenant: config.tenant,
            t: data.t,
            vcc: data.vcc,
            chipId: data.id,
            createdAt: new Date().toISOString()
        };
        if (data.heater !== undefined) {
            value.heater = data.heater;
        }
        mongoDb.collection("current_metrics").updateOne({
            tenant: value.tenant,
            chipId: value.chipId
        }, value, {upsert: true});
        return mongoDb.collection("metrics").insertOne(value);

    })
}


function findAlias(aliases, chipId) {
    var filtered = aliases.filter(function (alias) {
        return alias.chipId == chipId
    });
    if (filtered.length == 1) {
        return filtered[0].name;
    } else {
        return chipId;
    }
}

function metrics(tenant) {
    return new Promise(function (resolve, reject) {
        mongoDb.collection("current_metrics").find({tenant: tenant}).sort({_id: -1}).limit(50).toArray().then(
            function (feed) {
                allAliases(tenant).then(function (aliases) {
                    var now = new Date().getTime();
                    resolve(feed.map(function (doc) {
                        delete doc['_id'];
                        delete doc['tenant'];
                        doc.age = (now - new Date(doc.createdAt).getTime()) / 1000;
                        doc.alias = findAlias(aliases, doc.chipId);
                        return doc;
                    }));
                });
            }
        ).catch(reject);
    });
}

function newAlias(tenant, chipId, name) {
    return mongoDb.collection("aliases").updateOne({tenant: tenant, chipId: chipId}, {
        tenant: tenant,
        chipId: chipId,
        name: name
    }, {upsert: true});
}

function allAliases(tenant) {
    return mongoDb.collection("aliases").find({tenant: tenant}).toArray();
}

function stats(tenant) {
    const config = {
        timeWindow: 3600000,
        tags: ["chipId"],
        fields: [
            {name: "t", aggregate: "avg", tags: ["13928192"], alias: "t1"},
            {name: "t", aggregate: "avg", tags: ["13928129"], alias: "t2"},
            {name: "vcc", aggregate: "avg", tags: ["13928192"], alias: "vcc1"},
            {name: "vcc", aggregate: "avg", tags: ["13928129"], alias: "vcc2"}

        ]
    };
    var stream = mongoDb.collection("metrics").find({
        "tenant": tenant,
        "createdAt": {"$gt": "2017-02-01T12:00:00.000Z"}
    }).stream();

    var aggregator = new Aggregator({objectMode:true}, config);
    stream.pipe(aggregator);
    return aggregator;

}

