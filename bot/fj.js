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
  move: 8
}

var serverCode = {
  update: 1,
  joined: 2,
  info: 3,
  stash: 4,
  scale: 5,
  leaderboard: 6,
  die: 7
}

var unitType = {
  core: 0,
  basicUnit: 1,
  basicTurret: 2
}

var materialNum = 5;
var materialNames = ["Wood", "Iron", "Gold", "Diamond", "Amethyst"];

var inputs = {
  "w": 87,
  "up": 38,
  "a": 65,
  "left": 37,
  "s": 83,
  "down": 40,
  "d": 68,
  "right": 39,
  "lmb": 1
};

var unitTypes = [{
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
    cluster.fork();
  }
  // cluster.on ("exit", function (worker, code, signal) {
  //     console.log (`Bot ${worker.process.pid} died`);
  //     cluster.fork ();
  // });
} else {
  var ptmr = 1;

  var name = "[FJ_] " + chance.first();
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

  class Obj {
    constructor(id, x, y, size, material) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.size = size;
      this.material = material;
    }
  }

  class Unit extends Obj {
    init(type, owner, angle, rotation, hp) {
      this.type = type;
      this.owner = owner;
      this.angle = angle;
      this.rotation = rotation;
      this.hp = hp;
      this.buildable = unitTypes[this.type].buildable;
      this.upgradeAmount = expScale(unitTypes[this.type].cost, this.material + 1) - Math.floor(expScale(unitTypes[this.type].cost, this.material) / 4);
      this.deleteAmount = Math.floor(expScale(unitTypes[this.type].cost, this.material) / 2);
    }
  }

  class Floater extends Obj {
    init(rotation, hp) {
      this.rotation = rotation;
      this.hp = hp;
    }
  }

  class Bullet extends Obj {}

  class Player {
    constructor(name, score) {
      this.name = name;
      this.score = score;
    }
  }

  function play() {
    var buffer = new ArrayBuffer(byte + byte + name.length);
    var view = new DataView(buffer, 0);
    view.setUint8(0, clientCode.play, true);
    view.setUint8(1, name.length, true);
    var offset = byte + byte;
    for (var i = 0; i < name.length; i++) {
      view.setUint8(offset + i, name.charCodeAt(i), true);
    }
    io.send(buffer);
    players[self].name = name;
  }

  var io = new WebSocket("ws://" + process.argv[2] + ":9002");

  io.on("open", function() {
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

    switch (code) {
      case serverCode.update:
        var playing = false;

        var unitList = [];
        var floaterList = [];
        var bulletList = [];

        var numUnits = view.getInt32(offset, true);
        var numFloaters = view.getInt32(offset + int, true);
        var numBullets = view.getInt32(offset + int + int, true);
        var numPlayers = view.getInt32(offset + int + int + int, true);
        offset += int + int + int + int; // number of units, number of floaters, number of bullets, number of players
        var unitDataSize = int + float + float + float + float + byte + byte + int + float + float; // id, x, y, size, angle, type, material, owner, hp, rotation
        var floaterDataSize = int + float + float + float + float + byte + float; // id, x, y, size, rotation, material, hp
        var bulletDataSize = int + float + float + float + byte; // id, x, y, size, material
        var playerDataSize = int + int + byte; // id, score, name length

        for (var i = 0; i < numUnits; i++) {
          var id = view.getUint32(offset + i * unitDataSize + 0, true);
          var x = view.getFloat32(offset + i * unitDataSize + int, true);
          var y = view.getFloat32(offset + i * unitDataSize + int + float, true);
          var size = view.getFloat32(offset + i * unitDataSize + int + float + float, true);
          var angle = view.getFloat32(offset + i * unitDataSize + int + float + float + float, true);
          var type = view.getUint8(offset + i * unitDataSize + int + float + float + float + float, true);
          var material = view.getUint8(offset + i * unitDataSize + int + float + float + float + float + byte, true);
          var owner = view.getUint32(offset + i * unitDataSize + int + float + float + float + float + byte + byte, true);
          var hp = view.getFloat32(offset + i * unitDataSize + int + float + float + float + float + byte + byte + int, true);
          var rotation = view.getFloat32(offset + i * unitDataSize + int + float + float + float + float + byte + byte + int + float, true);

          unitList.push(id);

          if (Object.keys(units).indexOf(String(id)) > -1) {
            units[id].x = x;
            units[id].y = y;
            if (units[id].owner != self || !units[id].mouse) {
              units[id].angle = angle;
            }
            units[id].rotation = rotation;
            units[id].material = material;
            units[id].hp = hp;
            if (units[id].owner == self && units[id].type == unitType.core) {
              selfCore = units[id];
            }
          } else {
            units[id] = new Unit(id, x, y, size, material);
            units[id].init(type, owner, angle, rotation, hp);
            if (units[id].owner == self) {
              myUnits.push(units[id]);
            }
          }
        }

        offset += unitDataSize * numUnits;
        for (var i = 0; i < numFloaters; i++) {
          var id = view.getUint32(offset + i * floaterDataSize + 0, true);
          var x = view.getFloat32(offset + i * floaterDataSize + int, true);
          var y = view.getFloat32(offset + i * floaterDataSize + int + float, true);
          var size = view.getFloat32(offset + i * floaterDataSize + int + float + float, true);
          var rotation = view.getFloat32(offset + i * floaterDataSize + int + float + float + float, true);
          var material = view.getUint8(offset + i * floaterDataSize + int + float + float + float + float, true);
          var hp = view.getFloat32(offset + i * floaterDataSize + int + float + float + float + float + byte, true);

          floaterList.push(id);

          if (Object.keys(floaters).indexOf(String(id)) > -1) {
            floaters[id].x = x;
            floaters[id].y = y;
            floaters[id].rotation = rotation;
            floaters[id].hp = hp;
          } else {
            floaters[id] = new Floater(id, x, y, size, material);
            floaters[id].init(rotation, hp);
          }
        }

        offset += floaterDataSize * numFloaters;
        for (var i = 0; i < numBullets; i++) {
          var id = view.getUint32(offset + i * bulletDataSize + 0, true);
          var x = view.getFloat32(offset + i * bulletDataSize + int, true);
          var y = view.getFloat32(offset + i * bulletDataSize + int + float, true);
          var size = view.getFloat32(offset + i * bulletDataSize + int + float + float, true);
          var material = view.getUint8(offset + i * bulletDataSize + int + float + float + float, true);

          bulletList.push(id);

          if (Object.keys(bullets).indexOf(String(id)) > -1) {
            bullets[id].x = x;
            bullets[id].y = y;
          } else {
            bullets[id] = new Bullet(id, x, y, size, material);
          }
        }

        offset += bulletDataSize * numBullets;
        for (var i = 0; i < numPlayers; i++) {
          var id = view.getUint32(offset, true);
          var ascore = view.getUint32(offset + int, true);
          var nameLength = view.getUint8(offset + int + int, true);
          var name = "";
          for (var j = 0; j < nameLength; j++) {
            name += String.fromCharCode(view.getInt8(offset + int + int + byte + (j * byte), true));
          }
          if (Object.keys(players).indexOf(String(id)) < 0) {
            players[id] = new Player(name, ascore);
          } else {
            players[id].score = ascore;
          }
          offset += playerDataSize + nameLength;
        }

        for (id in units) {
          if (unitList.indexOf(Number(id)) < 0) {
            var index = myUnits.indexOf(units[id]);
            if (index > -1) {
              myUnits.splice(index, 1);
            }
            delete units[id];
          }
        }

        for (id in floaters) {
          if (floaterList.indexOf(Number(id)) < 0) {
            delete floaters[id];
          }
        }

        for (id in bullets) {
          if (bulletList.indexOf(Number(id)) < 0) {
            delete bullets[id];
          }
        }

        lastServerFrame = Date.now();

        break;
      case serverCode.joined:
        playing = true;
        go();
        loopInterval = setInterval(loop, 30);
        break;
      case serverCode.info:
        ptmr = view.getFloat32(offset + float + float, true);
        self = view.getUint32(offset + float + float + float, true);
        players[self] = new Player(name, 0);
		  ww = view.getFloat32 (offset, true) * ptmr;
		  wh = view.getFloat32 (offset + float, true) * ptmr;
        play();
        break;
      case serverCode.stash:
        for (var i = 0; i < materialNum; i++) {
          stash[i] = view.getInt32(offset + int * i, true);
        }
        score = view.getInt32(offset + int * i, true);
        break;
      case serverCode.die:
        playing = false;
        clearInterval(loopInterval);
        play();
        break;
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
      var buffer = new ArrayBuffer(byte + int + byte + byte + float); // code, parent id, type, material, angle
      var view = new DataView(buffer, 0);
      view.setUint8(0, clientCode.build, true);
      view.setUint32(byte, parent, true);
      view.setUint8(byte + int, type, true);
      view.setUint8(byte + int + byte, material, true);
      view.setFloat32(byte + int + byte + byte, angle, true);
      io.send(buffer);
    }

    function sendUpgrade(id) {
      var buffer = new ArrayBuffer(byte + int); // code, id
      var view = new DataView(buffer, 0);
      view.setUint8(0, clientCode.upgrade, true);
      view.setUint32(byte, id, true);
      io.send(buffer);
    }

    function sendDelete(id) {
      var buffer = new ArrayBuffer(byte + int); // code, id
      var view = new DataView(buffer, 0);
      view.setUint8(0, clientCode.delete, true);
      view.setUint32(byte, id, true);
      io.send(buffer);
    }

    // TODO
    // Start your bot code here

	 var currentID = 0;
	 var currentMaterial = 0;
	 var lastLength = 0;
	 var locked = false;

	 function go() {
		 setInput ("lmb", true);
    }

	 function loop() {
		 if (selfCore == null) { return; }
		 if (myUnits.length != lastLength)
		 {
			 lastLength = myUnits.length;
			 locked = false;
		 }

		 var targetList = [];
		 var playerList = [];

		 for (var id in floaters)
		 {
			 if (floaters[id].material == 0)
			 {
				 targetList.push(floaters[id]);
			 }
		 }

		 for (var id in units)
		 {
			 var player = players[units[id].owner];

			 if (id != String(self) && player.name.indexOf("FJ_") == -1 && player.name.indexOf("Ninja") == -1)
			 {
			 	 playerList.push({unit:units[id], player:player});
			 }
		 }

		 targetList.sort(function(a, b)
		 {
			 var dist1 = dfp(selfCore.x, selfCore.y, a.x, a.y);
			 var dist2 = dfp(selfCore.x, selfCore.y, b.x, b.y);
			 return dist1 - dist2;
		 });

		 playerList.sort(function(a, b)
	 	 {
			 var score1 = a.player.score;
			 var score2 = b.player.score;
			 return score1 - score2;
	 	 });

		 if (playerList.length > 0)
		 {
			 setMouse((playerList[0].unit.x - selfCore.x) * ptmr, (playerList[0].unit.y - selfCore.y) * ptmr);
			 setMove(afp(selfCore.x, selfCore.y, playerList[0].unit.x, playerList[0].unit.y), 1);
		 }
		 else if (targetList.length > 0)
		 {
			 setMouse((targetList[0].x - selfCore.x) * ptmr, (targetList[0].y - selfCore.y) * ptmr);
			 setMove(afp(selfCore.x, selfCore.y, targetList[0].x, targetList[0].y), 1);
		 }
		 else
		 {
			 setMouse(ww / 2 - (selfCore.x * ptmr), wh / 2 - (selfCore.y * ptmr));
		 	 setMove(afp(selfCore.x * ptmr, selfCore.y * ptmr, ww / 2, wh / 2), 1);
		 }

		 if (stash[currentMaterial] >= unitTypes[currentID + 1].cost)
		 {
			 lastLength = myUnits.length;
			 if (!locked)
			 {
				 //console.log(myUnits[Math.floor(Math.random() * myUnits.length)], currentID + 1, currentMaterial, Math.random() * (Math.PI * 2));
				 sendBuild(myUnits[Math.floor(Math.random() * myUnits.length)].id, currentID + 1, currentMaterial, Math.random() * (Math.PI * 2));
				 locked = true;
				 currentID++;
				 if (currentID + 1 >= unitTypes.length)
				 {
					 currentID = 0;
					 currentMaterial++;
				 }
		 	 }
		 }
    }

    // End your bot code here
  });
}

//Function: angle from points
function afp(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
};

//Function: point from angle
function pfa(x, y, a, d) {
  return {
    x: Math.cos(a) * d + x,
    y: Math.sin(a) * d + y
  };
};

//Function: distance from points
function dfp(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
};

function linearScale(amount, material) {
  return amount * (material + 1);
}

function expScale(amount, material) {
  return amount * Math.pow(2, material);
}
