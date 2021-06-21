var Raven = require("raven");
Raven.config('').install();

var fs = require("fs");
var express = require("express");
var app = express();
// var cors = require("cors");
var api = require(__dirname + "/api.js");
var sl = require(__dirname + "/serverlist.js");
var serversList = require(__dirname + "/servers.json").regions;
var serversActual = {};
var maxmind = require("maxmind");
var search = maxmind.openSync(__dirname + "/GeoLite2-City.mmdb");
var fs = require("fs");

var updateInterval = 4000;
var stats = null;

var logStats = null;
var logInterval = 1800000; // 30 minutes
var logTotal = 0;
var logChecks = 0;

var autoscale = true;
var scaleCheckInterval = 30000; // 30 seconds
var scaleCooldown = 1800000; // 30 minutes
var scaleBuffer = 60;
var lastScale = {};

// var brRegions = ["atlanta"];

// app.use(cors());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// N: +, S: -, E: +, W: -

function listen() {
	app.get("/find", function(req, res) {
		// var data = search.get("124.169.106.173");//(req.ip);
		var data = search.get(req.ip);
		var foundGeo = true;
		var sortedServersList = serversList.slice(0);
		var idealRegion = null;
		if (data != null && data.location != null) {
			sortedServersList.sort(function(a, b) {
				return calculateDistance(data.location.latitude, data.location.longitude, a.lat, a.long) > calculateDistance(data.location.latitude, data.location.longitude, b.lat, b.long);
			});
			idealRegion = sortedServersList[0].name;
		} else {
			foundGeo = false;
		}

		var mode = "ffa";
		if ("mode" in req.query) {
			if (req.query.mode == "br") mode = req.query.mode;
		}

		var eu = null;
		if (data != null && data.continent != null) {
			if (data.continent.names.en == "Europe") {
				eu = true;
			} else {
				eu = false;
			}
		}

		var info = {eu: eu};

		var closestRegion = null;
		var best = null;
		if (mode == "ffa") {
			for (var i = 0; i < sortedServersList.length; i++) {
				var stat = stats.regions[sortedServersList[i].name];
				if (serversActual[sortedServersList[i].name].filter(function(server){return server.gameMode == "ffa";}).length > 0 && stat.players < stat.max) {
					closestRegion = sortedServersList[i].name;
					break;
				}
			}
		} else if (mode == "br") {
			var ffaThing = {};
			var brMaxWaiting = 0;
			var brMaxServer = null;
			var brMaxRegion = null;
			for (var region in serversActual) {
				ffaThing[region] = -1;
				for (var i = 0; i < serversActual[region].length; i++) {
					var disServer = serversActual[region][i];
					if (disServer.gameMode == "br") {
						if (disServer.joined > brMaxWaiting) {
							brMaxWaiting = disServer.joined;
							brMaxServer = disServer;
							brMaxRegion = region;
						}
					} else {
						if (ffaThing[region] == -1) ffaThing[region] = 0;
						ffaThing[region] += disServer.players;
					}
				}
			}

			if (brMaxServer != null) {
				best = brMaxServer;
				closestRegion = brMaxRegion;
			} else {
				var ffaMax = -1;
				var ffaMaxRegion = null;
				for (var region in ffaThing) {
					if (ffaThing[region] > ffaMax && serversActual[region].filter(function(server){return server.gameMode == "br";}).length > 0) {
						ffaMax = ffaThing[region];
						ffaMaxRegion = region;
					}
				}
				if (ffaMaxRegion != null) {
					for (var i = 0; i < serversActual[ffaMaxRegion].length; i++) {
						if (serversActual[ffaMaxRegion][i].gameMode == "br") {
							best = serversActual[ffaMaxRegion][i];
							closestRegion = ffaMaxRegion;
							break;
						}
					}
				}
			}
		}

		if (closestRegion != null) {
			if (foundGeo) {
				if (closestRegion != idealRegion) {
					logStats.regions[idealRegion].denied++;
				}
			}

			if (mode == "ffa") {
				best = bestServer(serversActual[closestRegion], mode);
			}

			if (best != null) {
				info.ip = best.ip;
				info.region = closestRegion;
				info.version = best.version;
				info.error = false;
				var ipParts = best.ip.split(".");
				var ipBinary = new Uint8Array(ipParts.length);
				for (var i = 0; i < ipParts.length; i++) {
					ipBinary[i] = Number(ipParts[i]);
				}
				info.link = new Buffer(ipBinary).toString("hex"); // Convert back: https://gist.github.com/tauzen/3d18825ae41ff3fc8981
			} else {
				info.error = true;
				logStats.denied++;
			}
		} else {
			info.error = true;
			logStats.denied++;
		}
		info.players = stats.total + 1;
	info.isLatest = "yes";
	if (info.error) Raven.captureException(req.ip + ", " + closestRegion);
		res.json(info);
	});

	app.get("/players", function(req, res) {
		var data = search.get(req.ip);
		var eu = null;
		if (data != null && data.continent != null) {
			if (data.continent.names.en == "Europe") {
				eu = true;
			} else {
				eu = false;
			}
		}
		res.json({players: stats.total + 1, eu: eu});
	});

	app.listen(8001, function() {
		console.log("Load balancer listening on port 8001");
	});

	if (autoscale) {
		setInterval(function() {
			for (var r in stats.regions) {
				var region = stats.regions[r];
				if ((r in lastScale || Date.now() - lastScale[r] > scaleCooldown) && region.max > 0 && region.max - region.players < scaleBuffer) {
					lastScale[r] = Date.now();
					api.create(r, function(e, id, ip) {
						if (e) {
							console.log(error);
						} else {
							console.log("Creating Linode " + id + " (" + ip + ") in " + r);
						}
					});
				}
			}
		}, scaleCheckInterval);
	}

	setInterval(function() {
		if (logStats != null) {
			logStats.total = Math.round(logStats.total / logChecks);
			logStats.max = Math.round(logStats.max / logChecks);
			logStats.servers = Math.round(logStats.servers / logChecks);
			for (var r in logStats.regions) {
				logStats.regions[r].players = Math.round(logStats.regions[r].players / logChecks);
				logStats.regions[r].max = Math.round(logStats.regions[r].max / logChecks);
				logStats.regions[r].servers = Math.round(logStats.regions[r].servers / logChecks);
			}

			var date = new Date();
			fs.appendFileSync("today.log", (("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2)) + "=>" + JSON.stringify(logStats) + "\n");

			logStats.total = 0;
			logStats.max = 0;
			logStats.servers = 0;
			logStats.denied = 0;
			for (var r in logStats.regions) {
				logStats.regions[r].players = 0;
				logStats.regions[r].max = 0;
				logStats.regions[r].servers = 0;
				logStats.regions[r].denied = 0;
			}
			logChecks = 0;
		}
	}, logInterval);
}

var firstUpdate = true;
function updateServers() {
	sl.update(false, updateInterval * 0.75, function(list, s) {
		serversActual = list;
		stats = s;
		updateLogStats();
		if (firstUpdate) {
			firstUpdate = false;
			listen();
		}
	});
}

setInterval(updateServers, updateInterval);
updateServers();

console.log("Waiting for data...");

function bestServer(aAll, mode) {
	a = aAll.filter(function(server) {
		return server.gameMode == mode;
	});
	var best = null;
	if (mode == "ffa") {
		var p1 = [];
		var p2 = [];
		var p3 = [];
		for (var i = 0; i < a.length; i++) {
			if (a[i].players > 0 && a[i].players < a[i].threshold) {
				p1.push(a[i]);
			} else if (a[i].players >= a[i].threshold && a[i].players < a[i].max) {
				p2.push(a[i]);
			} else if (a[i].players == 0) {
				p3.push(a[i]);
			}
		}
		if (p1.length > 0) {
			var max = -1;
			for (var i = 0; i < p1.length; i++) {
				if (p1[i].players > max) {
					max = p1[i].players;
					best = p1[i];
				}
			}
		} else if (p2.length > 0) {
			var min = -1;
			for (var i = 0; i < p2.length; i++) {
				if (min < 0 || p2[i].players < min) {
					min = p2[i].players;
					best = p2[i];
				}
			}
		} else if (p3.length > 0) {
			best = p3[0];
		}
	} else if (mode == "br") {
		var max = -1;
		for (var i = 0; i < a.length; i++) {
			if (a[i].joined > max) {
				max = a[i].joined;
				best = a[i];
			}
		}
	}
	if (best != null) {
		return best;
	} else { // Just in case
		for (var i = 0; i < aAll.length; i++) {
			if (aAll[i].players <aAll[i].max) {
				return aAll[i];
			}
		}
		return null;
	}
}

function updateLogStats() {
	if (firstUpdate) {
		logStats = JSON.parse(JSON.stringify(stats));
		logStats.denied = 0;
		for (var r in logStats.regions) {
			logStats.regions[r].denied = 0;
		}
	} else {
		if (logStats != null) {
			logStats.total += stats.total;
			logStats.max += stats.max;
			logStats.servers += stats.servers;
			for (var r in logStats.regions) {
				logStats.regions[r].players += stats.regions[r].players;
				logStats.regions[r].max += stats.regions[r].max;
				logStats.regions[r].servers += stats.regions[r].servers;
			}
		}
	}
	logChecks++;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
	var R = 6371;
	var dLat = deg2rad(lat2 - lat1);
	var dLon = deg2rad(lon2 - lon1);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}
