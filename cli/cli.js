var api = require(__dirname + "/../balancer/api.js");
var sl = require(__dirname + "/../balancer/serverlist.js");
const {exec, spawn} = require("child_process");
var FTPClient = require("ftp");
let SFTPClient = require("ssh2-sftp-client");
var UglifyJS = require("uglify-js");
var request = require("request");
var fs = require("fs");
var cp = require("child_process");
var colors = require("colors");

var password = ""
var password2 = ""
var loadBalancerPort = "8001";

var compileStart = "g++";
var compileEnd = "-std=c++11 -w -pthread main.cpp -lb2 -luWS -lssl -lcrypto -lz -luv";

var args = [];
if (process.argv.length > 2) {
	args = process.argv.splice(-(process.argv.length - 2));
}

var commands = {
	help: {
		help: "  prints info about all commands\n  [command]: prints info about command",
		run: function(a) {
			console.log("Usage: io1 [command] [options]");
			if (a.length > 0) {
				var which = a[0];
				if (commands[which] != undefined) {
					console.log(which + ":\n" + commands[a[0]].help);
				} else {
					console.log("Help for command not found: " + which);
				}
			} else {
				for (c in commands) {
					console.log(c + ":\n" + commands[c].help);
				}
			}
		}
	},
	create: {
		help: "  [location]: creates a single server in location\n  [location] [number]: creates number amount of servers in location",
		run: function(a) {
			var n = 1;
			if (a.length > 1) {
				n = Number(a[1]);
			}
			for (var i = 0; i < n; i++) {
				api.create(a[0], function(e, id, ip) {
					if (e) {
						console.error(e);
					} else {
						console.log("Created Linode " + id + " (" + ip + ")");
						uploadServerList();
					}
				});
			}
		}
	},
	destroy: {
		help: "  [location]: deletes the most recently created server in location\n  [location] [index]: deletes the server at index in location\n  [location] [ip]: deletes the server with the IP address ip in location",
		run: function(a) {
			var which = null;
			if (a.length > 1) {
				which = a[1];
			}
			api.destroy(a[0], which, function(e) {
				if (e) {
					console.error(e);
				} else {
					console.log("Destroyed Linode");
					uploadServerList();
				}
			})
		}
	},
	add: {
		help: "  [location] [ip]: adds ip to the server list in location",
		run: function(a) {
			sl.add(a[0], a[1]);
			console.log("Added " + a[1] + " to " + capital(a[0]));
		}
	},
	remove: {
		help: "  [location]: removes the most recently created server in location from the server list\n  [location] [index]: removes the server at index list in location from the server list\n  [location] [ip]: removes the server with the IP address ip in location from the server list",
		run: function(a) {
			if (a.length > 1) {
				sl.remove(a[0], a[1]);
				console.log("Removed " + a[1] + " from " + capital(a[0]));
			} else {
				sl.remove(a[0], null);
				console.log("Removed the most recently created server from " + capital(a[0]));
			}
		}
	},
	players: {
		help: "  displays the number of concurrent players connected to the game",
		run: function(a) {
			getLoadBalancer(function(ip) {
				if (ip != null) {
					request("http://" + ip + ":" + loadBalancerPort + "/players", function(e, r, b) {
						if (!e) {
							var n = JSON.parse(r.body).players - 1;
							var noun = "players";
							if (n == 1) {
								noun = "player";
							}
							console.log(n + " " + noun);
						} else {
							console.log("Error: could not retrieve the number of concurrent players");
						}
					});
				}
			});
		}
	},
	servers: {
		help: "  displays list of servers\n  [location]: displays list of servers in location",
		run: function(a) {
			var regions = sl.get();
			var start = 0;
			var number = regions.length;
			if (a.length > 0) {
				start = regions.indexOf(regions.find(function(o) {
					return o.name == a[0];
				}));
				number = 1;
			}
			for (var i = start; i < start + number; i++) {
				if (regions[i].servers.length > 0) {
					console.log(capital(regions[i].name));
					console.log("    " + regions[i].servers.join("\n    "));
				}
			}
		}
	},
	status: {
		help: "  displays status for all servers\n  [location]: displays status for servers in location",
		run: function(a) {
			console.log("Contacting servers...");
			sl.update(true, 3000, function(regions, stats) {
				if (a.length > 0) {
					var r = regions[a[0]];
					regions = {};
					regions[a[0]] = r;
				}
				var totalJoined = 0;
				var totalNumber = 0;
				var totalCapacity = 0;
				var totalServers = 0;
				var totalUp = 0;
				for (var r in regions) {
					var s = "";
					var joined = 0;
					var number = 0;
					var capacity = 0;
					if (regions[r].length > 0) {
						regions[r].sort(function(a, b) {
							return a.players < b.players;
						});
						for (var i = 0; i < regions[r].length; i++) {
							totalServers++;
							totalUp++;
							var info = "    " + regions[r][i].gameMode;
							if (regions[r][i].gameMode == "br") info += " ";
							info += " ";
							var color = "green";
							if (regions[r][i].gameMode == "br") color = "yellow"
							if (regions[r][i].error && regions[r][i].max != -1) {
								info += regions[r][i].ip;
								totalUp--;
								color = "red";
							} else {
								var ipParts = regions[r][i].ip.split(".");
								var ipBinary = new Uint8Array(ipParts.length);
								for (var j = 0; j < ipParts.length; j++) {
									ipBinary[j] = Number(ipParts[j]);
								}
								if (regions[r][i].restarts != 0) {
									info = "  * " + regions[r][i].gameMode;
									if (regions[r][i].gameMode == "br") info += " ";
									info += " ";
								}
								if (regions[r][i].max == -1) {
									info += "(" + regions[r][i].joined + "/" + regions[r][i].players + ")";
									capacity += regions[r][i].players;
									color = "magenta";
									if (regions[r][i].gameMode == "br") color = "cyan"
								} else {
									info += "(" + regions[r][i].joined + "/" + regions[r][i].players + "/" + regions[r][i].max + ")";
									capacity += regions[r][i].max;
								}
								info += " " + regions[r][i].ip + " [v" + regions[r][i].version + ", " + regions[r][i].fps + "fps, #" + new Buffer(ipBinary).toString("hex") + "]";
								joined += regions[r][i].joined;
								number += regions[r][i].players;
							}
							if (i < regions[r].length - 1) {
								info += "\n";
							}
							s += info.bold[color];
						}
						console.log(capital(r) + " (" + joined + "/" + number + "/" + capacity + ")\n" + s);
					}
					totalJoined += joined;
					totalNumber += number;
					totalCapacity += capacity;
				}
				if (a.length == 0) {
					console.log("Total: " + totalJoined + "/" + totalNumber + "/" + totalCapacity);
				}
				console.log("Operational: " + totalUp + "/" + totalServers);
				process.exit(0);
			});
		}
	},
	log: {
		help: "  get: downloads yesterday's log file from the load balancer\n  show: opens a webpage with a chart, visualising the log data",
		run: function(a) {
			switch(a[0]) {
				case "get":
					getLoadBalancer(function(ip) {
						if (ip != null) {
							console.log("Connecting to load balancer");
							var sftp = new SFTPClient();
							sftp.connect({
								host: ip,
								username: "root",
								password: password
							}).then(function() {
								console.log("Downloading log");
								var day = "yesterday";
								if (a.length > 1) {
									day = a[1];
								}
								return sftp.get("/root/balancer/" + day + ".log");
							}).then(function(stream) {
								stream.pipe(fs.createWriteStream(__dirname + "/data.js"));
								stream.on("close", function() {
									fs.readFile(__dirname + "/data.js", "utf8", function(e, data) {
										if (e) {
											console.error("Error: could not read log file");
										} else {
											var a = data.split("\n");
											if (a[a.length - 1] == "") {
												a.splice(-1, 1);
											}
											fs.writeFile(__dirname + "/data.js", "var data = " + JSON.stringify(a) + ";", function(e) {
												if (!e) {
													console.log("Done");
													process.exit(0);
												} else {
													console.error("Error: could not format data file");
												}
											});
										}
									});
								});
							}).catch(function(e) {
								console.error(e);
								process.exit(1);
							});
						}
					});
					break;
				case "show":
					cp.exec("/mnt/c/Program\\ Files\\ \\(x86\\)/Google/Chrome/Application/chrome.exe file:///C:/Luke/io1/cli/log.html");
					break;
				default:
					console.log("Subcommand mode not found: " + a[0]);
					break;
			}
		}
	},
	compile: {
		help: "  compiles the game server source code for testing\n  [mode]: compiles with a specific compile mode\n  modes:\n    test: (default) compiles for testing\n    debug: compiles for debugging\n    release: compiles for production",
		run: function(a) {
			var onDone = function(code) {
				process.exit(code);
			}
			if (a.length > 0) {
				compile(a[0], onDone);
			} else {
				compile("test", onDone);
			}
		}
	},
	run: {
		help: "  runs the compiled game server",
		run: function(a) {
			run(a);
		}
	},
	go: {
		help: "  compiles the game server for testing, and runs\n  [mode]: compiles with a specific compile mode, and runs",
		run: function(a) {
			var onDone = function(code) {
				if (code == 0) {
					a.shift();
					if (!a) {
						a = [];
					}
					run(a);
				}
			}
			if (a.length > 0) {
				compile(a[0], onDone);
			} else {
				compile("test", onDone);
			}
		}
	},
	background: {
		help: "  runs the static server as a background process",
		run: function(a) {
			exec("forever start " + __dirname + "/../static.js");
			console.log("Static server is running in background");
		}
	},
	pull: {
		help: "  downloads the server list from the load balancer",
		run: function(a) {
			downloadServerList();
		}
	},
	push: {
		help: "  uploads the server list to the load balancer",
		run: function(a) {
			uploadServerList();
		}
	},
	deploy: {
		help: "  deploys game, static, balancer and bot code\n  [mode]: deploys with a specific deploy mode\n  modes:\n    all: (default) deploys everything\n    game: deploys only game server code\n    static: deploys only client code\n    balancer: deploys only load balancer code\n    bot: deploys only bot code",
		run: function(a) {
			var deployGame = false;
			var deployStatic = false;
			var deployBalancer = false;
			var deployBot = false;
			var deployNumber = 0;
			var finishedDeploying = 0;
			if (a.length == 0) {
				deployGame = true;
				deployStatic = true;
				deployBalancer = true;
				deployBot = true;
				deployNumber = 4;
			} else {
				if (a[0] == "game") {
					deployGame = true;
					deployNumber = 1;
				} else if (a[0] == "static") {
					deployStatic = true;
					deployNumber = 1;
				} else if (a[0] == "balancer") {
					deployBalancer = true;
					deployNumber = 1;
				} else if (a[0] == "bot") {
					deployBot = true;
					deployNumber = 1;
				} else if (a[0] == "all") {
					deployGame = true;
					deployStatic = true;
					deployBalancer = true;
					deployBot = true;
					deployNumber = 4;
				} else {
					console.log("Deploy type not found: " + a[0]);
				}
			}
			if (deployGame) {
				var ftp = new FTPClient();
				ftp.on("ready", function() {
					console.log("[Game] Uploading game executable");
					ftp.put(__dirname + "/../a.out", "/_private/a.out", function(e) {
						if (!e) {
							console.log("[Game] Done");
						} else {
							console.error("[Game] " + e);
						}
						ftp.end();
						finishedDeploying++;
						if (finishedDeploying >= deployNumber) {
							process.exit(0);
						}
					});
				});
				console.log("[Game] Connecting to server");
				ftp.connect({
					host: "example.com",
					user: "user",
					password: password2
				});
			}
			if (deployStatic) {
				var version = minify(a[1]);
				console.log("[Static] Minfied client code");
				var localPath = "/mnt/c/Luke/io1/public/";
				var remotePath = "public_html/";
				var ftp = new FTPClient();
				ftp.on("ready", function() {
					ftp.put(localPath + "index.html", remotePath + "index.html", function(e) {
						if (!e) {
							console.log("[Static] Uploaded index.html");
							ftp.put(localPath + "style.css", remotePath + "style.css", function(e) {
								if (!e) {
									console.log("[Static] Uploaded style.css");
									ftp.put(localPath + version + ".min.js", remotePath + version + ".min.js", function(e) {
										if (!e) {
											console.log("[Static] Uploaded " + version + ".min.js");
											ftp.put(localPath + "loader.js", remotePath + "loader.js", function(e) {
												if (!e) {
													console.log("[Static] Uploaded loader.js");
													console.log("[Static] Done");
													ftp.end();
													finishedDeploying++;
													if (finishedDeploying >= deployNumber) {
														process.exit(0);
													}
												} else {
													console.error("[Static] " + e);
													ftp.end();
												}
											});
										} else {
											console.error("[Static] " + e);
										}
									});
								} else {
									console.error("[Static] " + e);
									ftp.end();
								}
							});
						} else {
							console.error("[Static] " + e);
							ftp.end();
						}
					});
				});
				console.log("[Static] Connecting to server");
				ftp.connect({
					host: "tanksmith.io",
					user: "user",
					password: "password"
				});
			}
			if (deployBalancer) {
				var file = "balancer.js";
				if (a.length > 1) {
					file = a[1];
				}
				var ftp = new FTPClient();
				ftp.on("ready", function() {
					console.log("[Balancer] Uploading " + file);
					ftp.put(__dirname + "/../balancer/" + file, "/_private/" + file, function(e) {
						if (!e) {
							console.log("[Balancer] Done");
							getLoadBalancer(function(ip) {
								if (ip != null) {
									console.log("[Balancer] Connecting to load balancer");
									var sftp = new SFTPClient();
									sftp.connect({
										host: ip,
										username: "root",
										password: password
									}).then(function() {
										console.log("[Balancer] Uploading " + file);
										return sftp.put(__dirname + "/../balancer/" + file, "/root/balancer/" + file);
									}).then(function() {
										console.log("[Balancer] Done");
										finishedDeploying++;
										if (finishedDeploying >= deployNumber) {
											process.exit(0);
										}
									}).catch(function(e) {
										console.error("[Balancer] " + e);
										finishedDeploying++;
										if (finishedDeploying >= deployNumber) {
											process.exit(0);
										}
									});
								} else {
									finishedDeploying++;
									if (finishedDeploying >= deployNumber) {
										process.exit(0);
									}
								}
							});
						} else {
							console.error("[Balancer] " + e);
						}
						ftp.end();
					});
				});
				console.log("[Balancer] Connecting to server");
				ftp.connect({
					host: "domain.com",
					user: "user",
					password: password2
				});
			}
			if (deployBot) {
				var ftp = new FTPClient();
				ftp.on("ready", function() {
					console.log("[Bot] Uploading bot code");
					ftp.put(__dirname + "/../bot/bot.js", "/_private/bot.js", function(e) {
						if (!e) {
							console.log("[Bot] Done");
						} else {
							console.error("[Bot] " + e);
						}
						ftp.end();
						finishedDeploying++;
						if (finishedDeploying >= deployNumber) {
							process.exit(0);
						}
					});
				});
				console.log("[Bot] Connecting to server");
				ftp.connect({
					host: "domain.com",
					user: "user",
					password: password2
				});
			}
		}
	},
	minify: {
		help: "  minifies client code and outputs file",
		run: function(a) {
			minify(a[1]);
			console.log("Minified client code");
		}
	}
}

function compile(mode, callback) {
	var options;
	if (mode == "release") {
		options = " -O3 ";
	} else if (mode == "test") {
		options = " ";
	} else if (mode == "debug") {
		options = " -g ";
	} else {
		console.log("Compile mode not found: " + mode);
		return 1;
	}
	exec(compileStart + options + compileEnd, function(e, stdout, stderr) {
		if (stderr.length == 0) {
			console.log("Successfully compiled");
			callback(0);
		} else {
			console.log(stderr);
			callback(1);
		}
	});
}

function run(a) {
	var file = spawn("./a.out", a);
	file.stdout.on("data", function(data) {
		var string = data.toString();
		if (string.length > 0) {
			process.stdout.write(string);
		}
	});
	file.stderr.on("data", function(data) {
		var string = data.toString();
		if (string.length > 0) {
			process.stdout.write(string);
		}
	});
	file.on("exit", function(code) {
		console.log("Exited with code " + code);
	});
}

function getLoadBalancer(c) {
	request("http://tanksmith.io/lb.js", function(e, r, b) {
		if (!e) {
			var ip = b.split("\"")[1];
			if (ip != "localhost") {
				c(ip);
			} else {
				console.error("Error: load balancer is running locally");
				c(null);
			}
		} else {
			console.error("Error: cannot retrieve load balancer address");
			// c(null);
			c("45.33.42.188");
		}
	});
}

function downloadServerList() {
	getLoadBalancer(function(ip) {
		if (ip != null) {
			console.log("Connecting to load balancer");
			var sftp = new SFTPClient();
			sftp.connect({
				host: ip,
				username: "root",
				password: password
			}).then(function() {
				console.log("Downloading server list");
				return sftp.get("/root/balancer/servers.json");
			}).then(function(stream) {
				stream.pipe(fs.createWriteStream(__dirname + "/../balancer/servers.json"));
				stream.on("close", function() {
					console.log("Done");
					process.exit(0);
				});
			}).catch(function(e) {
				console.error(e);
				process.exit(1);
			});
		}
	});
}

function uploadServerList() {
	getLoadBalancer(function(ip) {
		if (ip != null) {
			console.log("Connecting to load balancer");
			var sftp = new SFTPClient();
			sftp.connect({
				host: ip,
				username: "root",
				password: password
			}).then(function() {
				console.log("Uploading server list");
				return sftp.put(__dirname + "/../balancer/servers.json", "/root/balancer/servers.json");
			}).then(function() {
				console.log("Done");
				process.exit(0);
			}).catch(function(e) {
				console.error(e);
				process.exit(1);
			});
		}
	});
}

function minify(version) {
	// var version = fs.readFileSync(__dirname + "/../version.txt", "utf8").slice(0, -1);
	var code = fs.readFileSync(__dirname + "/../public/" + version + ".js", "utf8");
	var minified = UglifyJS.minify(code);
	fs.writeFileSync(__dirname + "/../public/" + version + ".min.js", minified.code);
	return version;
}

function capital(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

var command = args[0];
if (command) {
	args.shift();
	if (Object.keys(commands).indexOf(command) > -1) {
		commands[command].run(args);
	} else {
		console.log("Command not found: " + command);
	}
} else {
	commands.help.run(["help"]);
}
