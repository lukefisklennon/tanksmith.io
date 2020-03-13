var cluster = require("cluster");
var WebSocket = require("ws");
var chance = new require("chance")();

var numBots = process.argv[3];

var byte = 1;
var short = 2;
var int = 4;
var float = 4;

var clientCode = {
	ready: 1,
	key: 2,
	play: 3,
	mouse: 4,
	build: 5,
	upgrade: 6,
	delete: 7,
	move: 8,
	ping: 9
}

var serverCode = {
	update: 1,
	joined: 2,
	info: 3,
	stash: 4,
	scale: 5,
	leaderboard: 6,
	die: 7,
	kick: 8,
	shake: 9,
	kill: 10,
	resize: 11
}

var unitType = {
	core: 0,
	basicUnit: 1,
	basicTurret: 2,
	sniperTurret: 3,
	twinTurret: 4,
	cannonTurret: 5,
	healingUnit: 6,
	alchemyLab: 7,
	boosterUnit: 8,
	octaTurret: 9,
	spike: 10
}

var materialNum = 6;
var materialNames = ["Wood", "Iron", "Gold", "Diamond", "Amethyst", "Onyx"];

var inputs = {"w": 87, "up": 38, "a": 65, "left": 37, "s": 83, "down": 40, "d": 68, "right": 39, "lmb": 1};

var unitTypes = [
    {
        name: "Core",
        cost: 32,
        size: 1.2,
        buildable: true
    },
    {
        name: "Basic Unit",
        cost: 8,
        size: 1,
        buildable: true
    },
    {
        name: "Basic Turret",
        cost: 12,
        size: 1,
        buildable: true
    },
    {
        name: "Sniper Turret",
        cost: 20,
        size: 1,
        buildable: true
    },
    {
        name: "Twin Turret",
        cost: 14,
        size: 1,
        buildable: true
    },
    {
        name: "Cannon Turret",
        cost: 24,
        size: 1,
        buildable: true
    },
    {
        name: "Healing Unit",
        cost: 16,
        size: 1,
        buildable: true
    },
    {
        name: "Alchemy Lab",
        cost: 22,
        size: 1,
        buildable: true
    },
    {
        name: "Booster Unit",
        cost: 18,
        size: 1,
        buildable: true
    },
    {
        name: "Octa Turret",
        cost: 24,
        size: 1,
        buildable: true
    },
    {
        name: "Spike",
        cost: 16,
        size: 0.5,
        buildable: false
    }
];

if (cluster.isMaster) {
    for (var i = 0; i < numBots; i++) {
		console.log("Fork #" + i);
        cluster.fork();
    }
    cluster.on("exit", function(worker, code, signal) {
    //     console.log(`Bot ${worker.process.pid} died`);
		setTimeout(function() {
			cluster.fork();
		}, 2000);
    });
} else {
    var ptmr = 1;

    // var name = "[iO] " + chance.first();
	var name = "🤖 " + chance.first(); // 8J+kliB
    var self = 0;

    var units = {};
    var floaters = {};
    var bullets = {};
    var players = {};

    var selfCore = null;
    var myUnits = [];

    var stash = [];
    var score = 0;

    var loopInterval = null;

	var Player = function(name, score) {
		this.name = name;
		this.score = score;
	}

	var Obj = function(id, x, y, size, material) {
		this.id = id;
		this.x = x;
		this.y = y;
		this.size = size;
		this.material = material;
		this.dying = false;
		this.alpha = 1;
		this.scale = 1;
	}

	var Unit = function(id, x, y, size, material, type, owner, angle, rotation, hp) {
		Obj.call(this, id, x, y, size, material);
		this.type = type;
		this.owner = owner;
		this.angle = angle;
		this.rotation = rotation;
		this.hp = hp;
		this.mouse = unitTypes[this.type].mouse;
		this.buildable = unitTypes[this.type].buildable;
		this.deleteAmount = Math.floor(expScale(unitTypes[this.type].cost, this.material) / 2);
	}

	Unit.prototype = new Obj();

	var Floater = function(id, x, y, size, material, rotation, hp) {
		Obj.call(this, id, x, y, size, material);
		this.rotation = rotation;
		this.hp = hp;
	}

	Floater.prototype = new Obj();

	var Bullet = function(id, x, y, size, material) {
		Obj.call(this, id, x, y, size, material);
	}

	Bullet.prototype = new Obj();

    function play() {
		// var string = new Buffer(unescape(encodeURIComponent(name))).toString("base64");
		var string = Buffer.from(name).toString("base64");
	    var charList = string.split("");
		var buffer = new ArrayBuffer(byte + byte + byte + charList.length);
		var view = new DataView(buffer, 0);
		view.setUint8(0, clientCode.play, true);
		view.setUint8(1, charList.length, true);
		view.setUint8(2, 0, true);
		var offset = byte + byte + byte;

		for (var i = 0; i < charList.length; i++) {
		   view.setUint8(offset + i, charList[i].charCodeAt(0), true);
	    }
    	io.send(buffer);
    	players[self].name = name;
    }

    var io = new WebSocket("ws://" + process.argv[2] + ":9002");

    io.on("open", function() {
		console.log("Connected to " + process.argv[2]);
        var buffer = new ArrayBuffer(byte);
        var view = new DataView(buffer, 0);
        view.setUint8(0, clientCode.ready, true);
        io.send(buffer);
    });

    io.on("message", function(message) {
        var data = new ArrayBuffer(message.length);
        var view = new Uint8Array(data);
        for (var i = 0; i < message.length; ++i) {
            view[i] = message[i];
        }
		var view = new DataView(data);
		var code = view.getUint8(0, true);
		var offset = byte;

		switch(code) {
			case serverCode.update:
				var unitList = [];
				var floaterList = [];
				var bulletList = [];

				var numUnits = view.getUint16(offset, true);
				offset += short;
				var numFloaters = view.getUint16(offset, true);
				offset += short;
				var numBullets = view.getUint16(offset, true);
				offset += short;
				var numPlayers = view.getUint16(offset, true);
				offset += short;

				for (var i = 0; i < numUnits; i++) {
					var id = view.getUint16(offset, true);
					offset += short;
					var x = view.getFloat32(offset, true);
					offset += float;
					var y = view.getFloat32(offset, true);
					offset += float;
					var size = view.getFloat32(offset, true);
					offset += float;
					var angle = view.getFloat32(offset, true);
					offset += float;
					var type = view.getUint8(offset, true);
					offset += byte;
					var material = view.getUint8(offset, true);
					offset += byte;
					var owner = view.getUint16(offset, true);
					offset += short;
					var hp = view.getFloat32(offset, true);
					offset += float;
					var rotation = view.getFloat32(offset, true);
					offset += float;

					unitList.push(id);

					if (Object.keys(units).indexOf(String(id)) > -1) {
						units[id].x = x;
						units[id].y = y;
						if (units[id].owner != self || !units[id].mouse) {
							units[id].angle = angle;
						}
						units[id].rotation = rotation;
						if (units[id].material != material) {
							units[id].deleteAmount = Math.floor(expScale(unitTypes[units[id].type].cost, material) / 2);
						}
						units[id].material = material;
						units[id].hp = hp;
						if (units[id].owner == self) {
							if (units[id].type == unitType.core) {
								selfCore = units[id];
							}
						}
						units[id].dying = false;
						units[id].alpha = 1;
						units[id].scale = 1;
					} else {
						units[id] = new Unit(id, x * ptmr, y * ptmr, size * ptmr, material, type, owner, angle, rotation, hp);
						if (units[id].owner == self) {
							myUnits.push(units[id]);
						}
					}
				}

				for (var i = 0; i < numFloaters; i++) {
					var id = view.getUint16(offset, true);
					offset += short;
					floaterList.push(id);
					var x = view.getFloat32(offset, true);
					offset += float;
					if (x != -1) {
						var y = view.getFloat32(offset, true);
						offset += float;
						var size  = view.getFloat32(offset, true);
						offset += float;
						var rotation = view.getFloat32(offset, true);
						offset += float;
						var material = view.getUint8(offset, true);
						offset += byte;
						var hp = view.getFloat32(offset, true);
						offset += float;
						if (Object.keys(floaters).indexOf(String(id)) > -1) {
							floaters[id].x = x;
							floaters[id].y = y;
							floaters[id].rotation = rotation;
							floaters[id].hp = hp;
							floaters[id].dying = false;
							floaters[id].alpha = 1;
							floaters[id].scale = 1;
						} else {
							floaters[id] = new Floater(id, x * ptmr, y * ptmr, size * ptmr, material, rotation, hp);
						}
						floaters[id].active = true;
					} else {
						delete floaters[id];
					}
				}

				for (var i = 0; i < numBullets; i++) {
					var id = view.getUint16 (offset, true);
					offset += short;
					var x = view.getFloat32(offset, true);
					offset += float;
					var y = view.getFloat32(offset, true);
					offset += float;
					var size  = view.getFloat32(offset, true);
					offset += float;
					var material = view.getUint8(offset, true);
					offset += byte;

					bulletList.push(id);

					if (Object.keys(bullets).indexOf(String(id)) > -1) {
						bullets[id].x = x;
						bullets[id].y = y;
						bullets[id].dying = false;
						bullets[id].alpha = 1;
						bullets[id].scale = 1;
					} else {
						bullets[id] = new Bullet(id, x * ptmr, y * ptmr, size * ptmr, material);
					}
				}

				for (var i = 0; i < numPlayers; i++) {
					var id = view.getUint16(offset, true);
					offset += short;
					var ascore = view.getUint32(offset, true);
					offset += int;
					var nameLength = view.getUint8(offset, true);
					offset += byte;
					var charArray = [];
					for (var j = 0; j < nameLength; j++) {
						charArray.push(view.getInt8(offset, true));
						offset += byte;
					}
					var decodedString = "";
					try {
						var encodedString = String.fromCharCode.apply(null, charArray);
						decodedString = decodeURIComponent(escape(atob(encodedString)));
					} catch(e) {}
					if (Object.keys(players).indexOf(String(id)) < 0) {
						players[id] = new Player(decodedString, ascore);
					} else {
						players[id].score = ascore;
					}
				}

				for (id in units) {
					if (unitList.indexOf(Number(id)) < 0) {
						delete units[id];
					}
				}

				for (id in floaters) {
					if (floaterList.indexOf(Number(id)) < 0) {
						// floaters[id].active = false;
						delete floaters[id];
					}
				}

				for (id in bullets) {
					if (bulletList.indexOf(Number(id)) < 0) {
						delete bullets[id];
					}
				}

				break;
			case serverCode.joined:
				playing = true;
                go();
                loopInterval = setInterval(loop, 100);
				break;
			case serverCode.info:
                ptmr = view.getFloat32(offset + float + float, true);
				self = view.getUint32(offset + float + float + float, true);
				players[self] = new Player(name, 0);
                play();
				break;
			case serverCode.stash:
				offset++;
				for (var i = 0; i < materialNum; i++) {
					stash[i] = view.getInt32(offset + int * i, true) - 5000;
				}
				score = view.getInt32(offset + int * i, true);

				break;
            case serverCode.die:
				playing = false;
                clearInterval(loopInterval);
                play();
				break;
        }

		function upgradeCost(u) {
			return expScale(unitTypes[u.type].cost, u.material + 1) - Math.floor(expScale(unitTypes[u.type].cost, u.material) / 4);
		}

        function setInput(name, value) {
            if (value) {
                value = 1;
            } else {
                value = 0;
            }
            var buffer = new ArrayBuffer(byte + byte + byte);
			var view = new DataView(buffer, 0);
			view.setUint8(0, clientCode.key, true);
			view.setUint8(1, inputs[name], true);
			view.setUint8(2, value, true);
			io.send(buffer);
        }

        function setMouse(x, y) {
            var buffer = new ArrayBuffer(byte + int + int);
    		var view = new DataView(buffer, 0);
    		view.setUint8(0, clientCode.mouse, true);
    		view.setInt32(byte, x, true);
    		view.setInt32(byte + int, y, true);
    		io.send(buffer);
        }

		function setMove(angle, thrust) {
			var buffer = new ArrayBuffer(byte + int + int);
    		var view = new DataView(buffer, 0);
    		view.setUint8(0, clientCode.move, true);
    		view.setFloat32(byte, angle, true);
    		view.setFloat32(byte + float, thrust, true);
    		io.send(buffer);
		}

        function sendBuild(parent, type, material, angle) {
            var buffer = new ArrayBuffer(byte + short + byte + byte + float); // code, parent id, type, material, angle
    		var view = new DataView(buffer, 0);
    		view.setUint8(0, clientCode.build, true);
    		view.setUint16(byte, parent, true);
    		view.setUint8(byte + short, type, true);
    		view.setUint8(byte + short + byte, material, true);
    		view.setFloat32(byte + short + byte + byte, angle, true);
    		io.send(buffer);
        }

        function sendUpgrade(id) {
            var buffer = new ArrayBuffer(byte + short); // code, id
    		var view = new DataView(buffer, 0);
            view.setUint8(0, clientCode.upgrade, true);
            view.setUint16(byte, id, true);
    		io.send(buffer);
        }

        function sendDelete(id) {
            var buffer = new ArrayBuffer(byte + short); // code, id
    		var view = new DataView(buffer, 0);
            view.setUint8(0, clientCode.delete, true);
            view.setUint16(byte, id, true);
    		io.send(buffer);
        }

        // TODO
        // Start your bot code here

		var scoreWidth = 1000;
        var targetMaterial = 0;
		var targetUnitType = Math.floor((Math.random() * unitTypes.length));
		if (targetUnitType == 8) {
			targetUnitType++;
		}
        var shootRange = 3;

        function go() {
            setInput("lmb", true);
        }

        function loop() {
			// targetMaterial = Math.floor(score / scoreWidth);
			targetMaterial = Math.floor(Math.sqrt(score / 200));
			if (targetMaterial > 4) {
				targetMaterial = 4;
			}
            if (selfCore != null) {
				var found = false;
				if (Object.keys(units).length > 0) {
					var closest = null;
	                var shortestDistance = Infinity;
	                for (var id in units) {
	                    if (units[id].owner != self/* && players[units[id].owner].name.indexOf("iO") < 0 && players[units[id].owner].name.indexOf("FJ_") < 0 */&& players[units[id].owner].score < score) {
	                        var distance = dfp(selfCore.x, selfCore.y, units[id].x, units[id].y);
	                        if (distance < shortestDistance) {
	                            closest = id;
	                            shortestDistance = distance;
	                        }
	                    }
	                }
	                if (closest != null) {
						found = true;
	                    setMouse((units[closest].x - selfCore.x) * ptmr,(units[closest].y - selfCore.y) * ptmr);
	                    if (shortestDistance > shootRange) {
							setMove(afp(selfCore.x, selfCore.y, units[closest].x, units[closest].y), 1);
	                    }
					}
				}
				if (!found && Object.keys(floaters).length > 0) {
	                var closest = null;
	                var shortestDistance = Infinity;
	                for (var id in floaters) {
	                    if (floaters[id].material == targetMaterial) {
	                        var distance = dfp(selfCore.x, selfCore.y, floaters[id].x, floaters[id].y);
	                        if (distance < shortestDistance) {
	                            closest = id;
	                            shortestDistance = distance;
	                        }
	                    }
	                }
					if (closest == null) {
						for (var id in floaters) {
	                        var distance = dfp(selfCore.x, selfCore.y, floaters[id].x, floaters[id].y);
	                        if (distance < shortestDistance) {
	                            closest = id;
	                            shortestDistance = distance;
	                        }
		                }
					}
	                if (closest != null) {
	                    setMouse((floaters[closest].x - selfCore.x) * ptmr,(floaters[closest].y - selfCore.y) * ptmr);
	                    if (shortestDistance > shootRange) {
							setMove(afp(selfCore.x, selfCore.y, floaters[closest].x, floaters[closest].y), 1);
	                    }
					} else {
						setMouse((0 - selfCore.x) * ptmr,(0 - selfCore.y) * ptmr);
						setMove(afp(selfCore.x, selfCore.y, 0, 0), 1);
					}
				}
			}
			var upgradeUnit = myUnits[Math.floor(Math.random() *(myUnits.length - 1))];
			var which = Math.floor(Math.random() * 2);
			if (which == 0) {
				if (stash[targetMaterial] >= unitTypes[targetUnitType].cost) {
					sendBuild(myUnits[Math.floor(Math.random() * myUnits.length)].id, targetUnitType, targetMaterial, Math.random() *(Math.PI * 2));
					// sendBuild(myUnits[0].id, targetUnitType, targetMaterial, 0);
					targetUnitType = Math.floor((Math.random() * unitTypes.length));
					if (targetUnitType == 8) {
						targetUnitType++;
					}
				}
			} else if (which == 1) {
				if (upgradeCost(upgradeUnit) <= stash[upgradeUnit.material + 1]) {
					sendUpgrade(upgradeUnit.id);
				}
			}
        }

		setInterval(function() {
			var buffer = new ArrayBuffer(byte);
			var view = new DataView(buffer, 0);
			view.setUint8(0, clientCode.ping, true);
			io.send(buffer);
		}, 3000);

        // End your bot code here
    });
}

//Function: angle from points
function afp(x1, y1, x2, y2) {
	return Math.atan2(y2 - y1, x2 - x1);
};

//Function: point from angle
function pfa(x, y, a, d) {
	return {x: Math.cos(a) * d + x, y: Math.sin(a) * d + y};
};

//Function: distance from points
function dfp(x1, y1, x2, y2) {
	return Math.sqrt((x1 - x2) *(x1 - x2) +(y1 - y2) *(y1 - y2));
};

function linearScale(amount, material) {
    return amount *(material + 1);
}

function expScale(amount, material) {
    return amount * Math.pow(2, material);
}
