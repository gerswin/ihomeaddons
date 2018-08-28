const fs = require('fs');
const path = require('path');
const sonoffServer = require("./sonoff.server.module.js");
var express = require('express');
var server = express();
var bodyParser = require('body-parser')
var http = require('http');
var ip = require('ip');

const configFile = '/config/sonoff.config.json'
const deviceFile = '/config/sonoff.devices.json'
const devicesHaFile = '/config/sonoff.ha.json'

//const configFile = './sonoff.config.json'
//const deviceFile = './sonoff.devices.json'
//const devicesHaFile = './sonoff.ha.json'
var config;
try {
    config = JSON.parse(fs.readFileSync(path.resolve(__dirname, configFile)));
} catch (err) {
    fs.createReadStream('./config/sonoff.config.json').pipe(fs.createWriteStream(configFile));
    fs.createReadStream('./config/sonoff.devices.json').pipe(fs.createWriteStream(deviceFile));
    config = JSON.parse(fs.readFileSync(path.resolve(__dirname, './config/sonoff.config.json')));
    console.log("Please check /config folder for sonoff.config.json and restart the addon")
}


var cache = {}
config.logger = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    trace: console.info,
    debug: console.debug,
};

if (process.env.HTTP_PORT !== undefined)
    config.server.httpPort = process.env.HTTP_PORT;
if (process.env.HTTPS_PORT !== undefined)
    config.server.httpsPort = process.env.HTTPS_PORT;
if (process.env.WEBSOCKET_PORT !== undefined)
    config.server.websocketPort = process.env.WEBSOCKET_PORT;
if (process.env.SERVER_IP !== undefined)
    config.server.IP = process.env.SERVER_IP;


const log = config.logger;

// call sonoff server for device handling
var devices = sonoffServer.createServer(config);

// Register body-parser
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

var httpServer = http.createServer(server)

httpServer.listen(config.server.httpPort, function() {
    log.log('API Server Started On Port %d', config.server.httpPort);
});

server.use('/', express.static('static'))

//returns an simple 0 or 1 for a known device
server.get('/devices/:deviceId/status', function(req, res) {
    log.log('GET | %s | %s ', req.method, req.url);

    var d = devices.getDeviceState(req.params.deviceId);
    console.log(d)
    if (!d || d == "disconnected") {
        res.status(404).send('Sonoff device ' + req.params.deviceId + ' not found');
    } else {
        res.status(200).send(((d == 'on') ? '1' : '0'));
    }
});

//switch the device
server.get('/devices/:deviceId/:state', function(req, res) {
    log.log('GET | %s | %s ', req.method, req.url);
    var d = devices.getDeviceState(req.params.deviceId);

    if (!d || d == "disconnected") {
        res.status(404).send('Sonoff device ' + req.params.deviceId + ' not found');
    } else {
        switch (req.params.state.toUpperCase()) {
            case "1":
            case "ON":
                res.sendStatus(200);
                devices.turnOnDevice(req.params.deviceId);
                break;
            case "0":
            case "OFF":
                res.sendStatus(200);
                devices.turnOffDevice(req.params.deviceId);
                break;
            default:
                res.status(404).send('Sonoff device ' + req.params.deviceId + ' can not be switched to "' + req.params.state + '", only "ON" and "OFF" are supported currently');
        }
    }
});

//get the known state of one known device
server.get('/devices/:deviceId', function(req, res) {
    log.log('GET | %s | %s ', req.method, req.url);
    var d = devices.getDeviceState(req.params.deviceId);
    if (!d || d == "disconnected") {
        res.status(404).send('Sonoff device ' + req.params.deviceId + ' not found');
    } else {
        res.json(devices.getConnectedDevices().find(d => d.id == req.params.deviceId));
    }
});

//get a list of known devices
server.get('/devices', function(req, res) {
    log.log('GET | %s | %s ', req.method, req.url);
    res.json(devices.getConnectedDevices());
});


/// HA Routines
function getStatic(){
    ind = 1
    try {
        let cnf = []
        var configDevices = JSON.parse(fs.readFileSync(deviceFile))
        var dev = devices.getConnectedDevices()
        dev.forEach(function(item) {
            if (item.device in configDevices) {
                configDevices[item.device].forEach(function(i, idx) {
                    console.log(idx)
                    console.log(item)
                    try {
                        i['state'] = (item.state[idx].switch == 'on' ? true : false)
                        ind = ind + 1
                        i['intID'] = ind
                        cnf.push(i)
                    } catch (error) {
                        throw error
                        // expected output: SyntaxError: unterminated string literal
                        // Note - error messages will vary depending on browser
                    }


                })
            }
        })

        fs.writeFile(devicesHaFile, JSON.stringify(cnf), (err) => {
            // throws an error, you could also catch it here
            if (err) throw err;
        });
}
// save name for every outlet
server.post('/savecnf', function(req, res) {
    var configDevices = JSON.parse(fs.readFileSync(deviceFile));
    let cnf = req.body
    Object.keys(req.body).forEach(function(item) {
        configDevices[item] = cnf[item]
    });
    fs.writeFile(deviceFile, JSON.stringify(configDevices), (err) => {
        // throws an error, you could also catch it here
        getStatic();
        if (err) throw err;
    });
    res.send(req.body); // echo the result back
});

server.get('/genstatic', function(req, res) {
    ind = 1
    try {
        let cnf = []
        var configDevices = JSON.parse(fs.readFileSync(deviceFile))
        var dev = devices.getConnectedDevices()
        dev.forEach(function(item) {
            if (item.device in configDevices) {
                configDevices[item.device].forEach(function(i, idx) {
                    console.log(idx)
                    console.log(item)
                    try {
                        i['state'] = (item.state[idx].switch == 'on' ? true : false)
                        ind = ind + 1
                        i['intID'] = ind
                        cnf.push(i)
                    } catch (error) {
                        throw error
                        // expected output: SyntaxError: unterminated string literal
                        // Note - error messages will vary depending on browser
                    }


                })
            }
        })

        fs.writeFile(devicesHaFile, JSON.stringify(cnf), (err) => {
            // throws an error, you could also catch it here
            if (err) throw err;
        });
        res.json(cnf) // echo the result back
    } catch (error) {
        throw error
        res.json({ status: false, error: error }) // echo the result back
    }
})


//switch on or off based on device outlet
server.get('/devices/:deviceId/:outlet/:state', function(req, res) {
    log.log('GET | %s | %s ', req.method, req.url);
    var d = devices.getDeviceState(req.params.deviceId);
    var outlet = req.params.outlet;
    if (!d || d == "disconnected") {
        res.status(404).send('Sonoff device ' + req.params.deviceId + ' not found');
    } else {
        switch (req.params.state.toUpperCase()) {
            case "1":
            case "ON":
            case "TRUE":
                res.sendStatus(200);
                devices.turnOnOutlet(req.params.deviceId, outlet);
                break;
            case "0":
            case "OFF":
            case "FALSE":
                res.sendStatus(200);
                devices.turnOffOutlet(req.params.deviceId, outlet);
                break;
            default:
                res.status(404).send('Sonoff device ' + req.params.deviceId + ' can not be switched to "' + req.params.state + '", only "ON" and "OFF" are supported currently');
        }
    }
});

server.get('/hadevices', function(req, res) {
    ind = 1
    try {
        let cnf = []
        var configDevices = JSON.parse(fs.readFileSync(deviceFile))
        var dev = devices.getConnectedDevices()
        dev.forEach(function(item) {
            if (item.device in configDevices) {
                configDevices[item.device].forEach(function(i, idx) {
                    console.log(idx)
                    console.log(item)
                    try {
                        i['state'] = (item.state[idx].switch == 'on' ? true : false)
                        ind = ind + 1
                        i['intID'] = ind
                        cnf.push(i)
                    } catch (error) {
                        throw error
                        // expected output: SyntaxError: unterminated string literal
                        // Note - error messages will vary depending on browser
                    }


                })
            }
        })


        res.json(cnf) // echo the result back
    } catch (error) {
        throw error
        res.json({ status: false, error: error }) // echo the result back
    }
})

server.get('/status/:uid/:action', function(req, res) {
    devices.onOrOffByUid(req.params.uid, req.params.action)

    res.json({ "state": req.params.action }); // echo the result back
});
server.get('/status/:uid', function(req, res) {
    //conmmute(req.params.uid,req.params.action)
    try {
        let cnf = []
        var configDevices = JSON.parse(fs.readFileSync(deviceFile))
        var dev = devices.getConnectedDevices()
        dev.forEach(function(item) {
            if (item.device in configDevices) {
                configDevices[item.device].forEach(function(i, idx) {
                    i['state'] = item.state[idx].switch == 'on' ? true : false
                    if (i.uid == req.params.uid) {
                        cnf.push(i)
                    }
                })
            }
        })


        res.json(cnf) // echo the result back
    } catch (error) {
        throw error
        res.json({ "status": false, error: error }); // echo the result back

    }
});
server.get('/loki', function(req, res) {
    res.json(devices.getDeviceStateLoki())
});

server.get('/ipadd', function(req, res) {
    var ipadd = ip.toString(new Buffer(ip.address() )) // 127.0.0.1
    res.json({ip:ipadd});
});
