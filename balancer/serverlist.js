var fs = require("fs");
var request = require("request");
var serversList = require(__dirname + "/servers.json").regions;

var infoPort = "7000";
var thresholdFactor = 0.8;
var hourAdd = 5;
var serversActual = {};

module.exports = {
    load: function() {
        serversList = JSON.parse(fs.readFileSync(__dirname + "/servers.json")).regions;
    },
    get: function() {
        this.load();
        return serversList;
    },
    update: function(includeBroken, serverResponseWait, c) {
        this.load();

		serversActual = {};

        var totalNumber = 0;
        var responses = 0;
        var stats = {
            total: 0,
            max: 0,
            servers: 0,
            regions: {}
        };
        var timeouts = {};
		var requests = {};

        for (var i = 0; i < serversList.length; i++) {
            totalNumber += serversList[i].servers.length * 2;
            if (Object.keys(serversActual).indexOf(serversList[i].name) == -1) {
                serversActual[serversList[i].name] = [];
            }
			stats.regions[serversList[i].name] = {
				players: 0,
				max: 0,
				servers: 0
			};

            for (var j = 0; j < serversList[i].servers.length; j++) {
                var callback = function(error, response, body) {
                    responses++;

                    var ok = (!error && response.statusCode == 200);
                    var ip = this.address;
					var gameMode = this.gameMode;

					clearTimeout(timeouts[ip + gameMode]);
					requests[ip + gameMode].abort();

                    var region = null;
                    for (var k = 0; k < serversList.length; k++) {
                        if (serversList[k].servers.indexOf(ip) > -1) {
                            region = serversList[k].name;
                            break;
                        }
                    }

                    if ((ok || includeBroken) && region != null) {
                        var data = [0, 0, 0, 0, 0, 0];
						if (ok) {
							data = body.split("\n");
						}
						data.splice(data.length - 1, 1);
						// if (ok) console.log(ip + ": " + body.split("\n").join(", "))

						if (Date.now() - Number(data[5]) > 10000 || Number(data[1]) == -1) {
							ok = false;
						}

						if (ok || includeBroken) {
	                        var serverData = {
	                            ip: ip,
								joined: Number(data[0]),
	                            players: Number(data[0]),
	                            max: Number(data[1]),
	                            threshold: Math.floor(Number(data[1]) * thresholdFactor),
	                            version: data[2],
								fps: data[3],
								restarts: data[4],
								gameMode: gameMode
	                        };

							if (data.length > 6) {
								serverData.joined = Number(data[6]);
							}

	                        if (ok) {
	                            serverData.error = false;
	                        } else {
	                            serverData.error = true;
	                        }

							if (!(region in serversActual)) {
								serversActual[region] = [];
							}
							serversActual[region].push(serverData);

							stats.total += serverData.players;
							stats.regions[region].players += serverData.players;
							if (serverData.max != -1 && ok) {
	                        	stats.max += serverData.max;
								stats.regions[region].max += serverData.max;
							} else {
								stats.max += serverData.players;
								stats.regions[region].max += serverData.players;
							}
							if (ok) {
		                        stats.servers++;
								stats.regions[region].servers++;
							}
						}
                    }

                    if (responses >= totalNumber) {
                        c(JSON.parse(JSON.stringify(serversActual)), JSON.parse(JSON.stringify(stats)));
                    }
                };
                requests[serversList[i].servers[j] + "ffa"] = request("http://" + serversList[i].servers[j] + ":" + infoPort + "/status.txt", (callback).bind({address: serversList[i].servers[j], gameMode: "ffa"}));
                timeouts[serversList[i].servers[j] + "ffa"] = setTimeout((callback).bind({address: serversList[i].servers[j], gameMode: "ffa"}), serverResponseWait, true, null, null);

				requests[serversList[i].servers[j] + "br"] = request("http://" + serversList[i].servers[j] + ":" + infoPort + "/br.txt", (callback).bind({address: serversList[i].servers[j], gameMode: "br"}));
                timeouts[serversList[i].servers[j] + "br"] = setTimeout((callback).bind({address: serversList[i].servers[j], gameMode: "br"}), serverResponseWait, true, null, null);
            }
        }

        if (totalNumber == 0) {
            c(JSON.parse(JSON.stringify(serversActual)), JSON.parse(JSON.stringify(stats)));
        }
    },
    add: function(r, ip) {
        this.load();
        var region = serversList.find(function(o) {
            return o.name == r;
        });
        region.servers.push(ip);
        save();
    },
    remove: function(r, ip) {
        this.load();
        var region = serversList.find(function(o) {
            return o.name == r;
        });
        if (ip == null) {
            ip = region.servers[region.servers.length - 1];
        } else if (ip.indexOf(".") < 0) {
            ip = region.servers[Number(ip)];
        }
        region.servers = region.servers.filter(function(s) {
            return s != ip;
        });
        save();
    },
	incrementHour: function(r) {
		var region = serversList.find(function(o) {
			return o.name == r;
		});
		region.hour += hourAdd;
		if (region.hour > 23) {
			region.hour -= 24;
		}
		save();
	}
}

function save() {
    fs.writeFileSync(__dirname + "/servers.json", JSON.stringify({regions: serversList}, null, "\t"));
}
