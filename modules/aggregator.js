var Transform = require('stream').Transform;

class Aggregator extends Transform {
    constructor(options, config) {
        super(options);
        this.config = config;
        this.timeWindow = null;
    }

    _transform(obj, encoding, callback) {
        try {
            var t = Math.floor(new Date(obj.createdAt).getTime() / this.config.timeWindow);
            if (this.timeWindow !== t) {
                this.newTimeWindow(t);
            }
            this.update(obj)
        } catch (err) {
            return callback(err);
        }

        callback();
    }

    _flush(callback) {
        this.newTimeWindow();
        this.push(null);
        callback();
    }

    newTimeWindow(t) {
        console.log("newTimeWindow " + t);
        if (this.timeWindow) {
            var out = {};
            out.createdAt = new Date(this.timeWindow*this.config.timeWindow);
            this.records.forEach(r => {
                this.config.fields.forEach(field => {
                    if (this.config.tags.every((tag, i)=> {
                            return r[tag] === field.tags[i]
                        })) {
                        switch (field.aggregate) {
                            case 'min':
                                out[field.alias] = r[field.name].min;
                                break;
                            case 'max':
                                out[field.alias] = r[field.name].max;
                                break;
                            case 'avg':
                                out[field.alias] = r[field.name].sum / r[field.name].count;
                                break;
                            case 'sum':
                                out[field.alias] = r[field.name].sum;
                                break;
                            case 'count':
                                out[field.alias] = r[field.name].count;
                                break;
                        }
                    }
                });
            });
            this.push(JSON.stringify(out));
        }
        this.timeWindow = t;
        this.records = [];
    }

    findOrCreateRecord(obj) {
        var list = this.records.filter(r=> {
            return this.config.tags.every(tag=> {
                return r[tag] === obj[tag]
            })
        });
        if (list.length == 0) {
            var r = {};
            this.config.tags.forEach(tag => {
                r[tag] = obj[tag]
            });
            this.records.push(r);
            return r;
        }
        return list[0];
    }

    update(obj) {
        var r = this.findOrCreateRecord(obj);
        this.config.fields.forEach(field => {
            var v = obj[field.name];
            var aggreg = r[field.name];

            if (!aggreg) {
                r[field.name] = {min: v, max: v, sum: v, count: 1};
            } else {
                if (v < aggreg.min) {
                    aggreg.min = v;
                }
                if (v > aggreg.max) {
                    aggreg.max = v;
                }
                aggreg.sum += v;
                aggreg.count += 1;
            }
        });
    }
}
module.exports = Aggregator;

