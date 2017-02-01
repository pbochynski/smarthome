var Aggregator = require('../modules/aggregator');

var config = {
    timeWindow: 3600000,
    tags: ["chipId"],
    fields: [
        {name: "t", aggregate: "avg", tags:["1"], alias: "t1"},
        {name: "t", aggregate: "avg", tags:["2"], alias: "t2"},
        {name: "vcc", aggregate: "avg", tags:["1"], alias: "vcc1"},
        {name: "vcc", aggregate: "avg", tags:["2"], alias: "vcc2"}

    ]
};

var chartAggreg = new Aggregator({objectMode:true}, config);

chartAggreg.write({chipId: "1", t: 20, vcc: 3.6, createdAt: new Date(2017, 0, 11, 14, 18, 0, 0)});
chartAggreg.write({chipId: "2", t: 30, vcc: 2.6, createdAt: new Date(2017, 0, 11, 14, 18, 0, 0)});
chartAggreg.write({chipId: "1", t: 21, vcc: 3.5, createdAt: new Date(2017, 0, 11, 14, 19, 0, 0)});
chartAggreg.write({chipId: "2", t: 31, vcc: 2.5, createdAt: new Date(2017, 0, 11, 14, 19, 0, 0)});
chartAggreg.write({chipId: "1", t: 22, vcc: 3.4, createdAt: new Date(2017, 0, 11, 14, 20, 0, 0)});
chartAggreg.write({chipId: "2", t: 32, vcc: 2.4, createdAt: new Date(2017, 0, 11, 14, 20, 0, 0)});
chartAggreg.write({chipId: "1", t: 23, vcc: 3.3, createdAt: new Date(2017, 0, 11, 14, 21, 0, 0)});
chartAggreg.write({chipId: "2", t: 33, vcc: 2.3, createdAt: new Date(2017, 0, 11, 14, 21, 0, 0)});
chartAggreg.end();


chartAggreg.pipe(process.stdout);
