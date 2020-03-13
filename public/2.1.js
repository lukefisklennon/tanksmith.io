// ["172.104.244.41", "139.162.138.164"]

io = null;

var go = function(ip) {
	try {
		var running = true;
		var connected = false;

		//Canvas element
		var canvas = document.getElementById("canvas");
		//Game game
		var game = canvas.getContext("2d");

		var debug = (window.location.hostname == "localhost");
		var dataTotal = 0;
		var dataInPeriod = 0;
		var dataPerPeriod = 0;
		var fps = 0;
		var usingActualAngle = false;
		var nameMax = 22;

		//Screen width and height
		var w;
		var h;

		// World width and height
		var ww = 0;
		var wh = 0;
		var $ww = 0;
		var $wh = 0;

		if (mobile) {
			var mobileLeaderboardNum = 5;

			dpr = window.devicePixelRatio || 1;

			var joystickDown = false;
			var joystickStartX = 0;
			var joystickStartY = 0;
			var joystickX = joystickStartX;
			var joystickY = joystickStartY;
			var joystickPos = {x: joystickX, y: joystickY};
			var joystickAngle = 0;
			var joystickDistance = 0;
			var lastJoystickAngle = 0;
			var lastJoystickPower = 0;
			var joystickPower = 0;
			var joystickSize = 60 * gameScale;
			var joystickAlpha = 0;

			var targetDown = false;
			var targetStartX = 0;
			var targetStartY = 0;
			var $targetOffsetX = 0;
			var $targetOffsetY = 0;
			var targetOffsetX = 0;
			var targetOffsetY = 0;
			var targetLastOffsetX = 0;
			var targetLastOffsetY = 0;
			var targetSize = 20 * gameScale;
			var targetSensitivity = 1.5;
			var targetIconAlpha = 0;
		}

		var mms = 100;
		var minimapDotSize = 3;

		var playing = false;
		var self = null;
		var hasPlayed = false;
		var canClearFloaters = false;
		var kills = 0;

		var keysCodes = [87, 38, 65, 37, 83, 40, 68, 39, 1, 2];
		var keyStates = {};
		var controlKey = false;
		var autoFire = false;
		var mx = 0;
		var my = 0;
		var amx = 0;
		var amy = 0;
		var lmx = mx;
		var lmy = my;

		var units = {};
		var floaters = {};
		var bullets = {};
		var players = {};

		var myUnits = [];

		var byte = 1;
		var short = 2;
		var int = 4;
		var float = 4;

		var ptmr = 1;

		var selfCore = null;
		var selfCoreHaloRotation = 0;
		var speedx = 0;
		var speedy = 0;
		var cx = ww / 2;
		var cy = wh / 2;
		var cs = 1;
		var $serverScale = 1;
		var serverScale = $serverScale;
		var screenPadding = 50;
		var dw = 1040;
		var dh = 590;
		var dr = dw / dh;
		var dpr = 1;
		var averageClientDelta = 15;
		var cameraSpeed = 0.1;
		var cameraLag = 4;
		var hpAlphaSpeed = 0.2;
		var shaking = false;
		var shakeTime = 500;
		var shakeAmount = 5;
		var defaultName = "Unknown";
		var dissolveScale = 0.2;
		var dissolveBlur = 10;
		var usingFilter = false;

		var placing = false;
		var placingType = 0;
		var placingMaterial = 0;
		var placingOn = 0;
		var placingAngle = 0;
		var placingWithin = false;

		var selectedUnit = null;

		var shortMessage = 4000;
		var longMessage = 8000;

		var originalLineWidth = 0.13;
		var lineWidth = originalLineWidth * ptmr;
		var lineShade = -0.3;

		var gridSize = 20;
		var gridLineWidth = 0.5;

		var originalStoreIconSize = 70;
		var storeIconSize = originalStoreIconSize;//310;//70;
		var $storeBarScroll = 0;
		var storeBarScroll = 0;
		var scriptScrollTrigger = false;
		var scannerPadding = 15;//60;//15;

		var materialNum = 6;
		var materialNames = ["Wood", "Iron", "Gold", "Diamond", "Amethyst", "Onyx"];
		var materialIcons = [];
		var originalStashIconSize = 22;
		var stashIconSize = originalStashIconSize;
		var stashIconLineWidth = 4;
		var $stash = [];
		var $oldStash = [];
		var stash = [];
		var oldStash = [];
		for (var i = 0; i < materialNum; i++) {
			$stash[i] = 0;
			$oldStash[i] = 0;
			stash[i] = 0;
			oldStash[i] = 0;
		}
		var $score = 0;
		var $oldScore = 0;
		var score = 0;
		var oldScore = 0;

		try {
			if (performance.navigation.type == 1) {
				playCount = 1;
			}
		} catch(e) {}

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
			octaTurret: 9,
			spike: 9
		}

		var shape = {
			circle: 0,
			triangle: 1
		}

		var storage = {
			name: "",
			tutorialStage: 0,
			socialTotal: 0,
			socialButtons: []
		};

		var tutorial = {
			wasd: 0,
			click: 1,
			shapes: 2,
			saveUp: 3,
			firstUnit: 4,
			gotUnit: 5
		}
		var tutorialDelay = 2000;
		var stashNotifyLocked = false;

		var materials = [
			"#790000",
			"#888888",
			"#efc000",
			"#1bebff",
			"#9400c0",
			"#333333",
			"#ff0000"
		]

		var gunMaterial = "#bfbfbf";
		var gunWidth = 0.6;
		var sniperGunWidth = 0.4;
		var sniperGunHeight = (1 / sniperGunWidth) * 1.4;

		var healingMaterial = "#fa0028";
		var healingThickness = 0.7;
		var healingPadding = 0.35;//10;

		var alchemyMaterial = "#73eeff";
		var alchemyOrbMult = 0.45;

		var gearMaterial = gunMaterial;
		var gearTeethNum = 10;
		var gearInset = 0.2;
		var gearSize = 0.8;

		var healthBarWidth = 40;
		var healthBarBorderWidth = 2;
		var healthBarBackgroundColor = "#595959";
		var healthBarForegroundColor = "#05d400";
		var healthBarPadding = 12;

		var nameFillColor = "#ffffff";
		var nameStrokeColor = "#111111";
		var nameLineWidth = 2;
		var nameFontSize = 20;
		var namePadding = 15;
		var nameHideDelay = 2000;
		var nameHideTime = 2000;
		var timeJoined = 0;

		var socialNum = 6;
		var socialBonus = 3;

		var unitTypesSorted = [];
		var unitTypes = [
			{
				name: "Core",
				cost: 0,
				size: 1.2,
				mouse: true,
				buildable: true,
				shape: shape.circle,
				description: "",
				top: function(c, x, y, size, angle, rotation, material) {
					unitTypes[unitType.basicTurret].top(c, x, y, size, angle, rotation, material);
				},
				bottom: function(c, x, y, size, angle, rotation, material) {
					unitTypes[unitType.basicUnit].bottom(c, x, y, size, angle, rotation, material);
				}
			},
			{
				name: "Basic Unit",
				cost: 0,
				size: 1,
				mouse: false,
				buildable: true,
				shape: shape.circle,
				description: "A simple unit which can protect your core",
				top: function(c, x, y, size, angle, rotation, material) {},
				bottom: function(c, x, y, size, angle, rotation, material) {
					c.fillStyle = materials[material];
					c.strokeStyle = shadeColor(materials[material], lineShade);

					c.beginPath();
					c.arc(x, y, size - c.lineWidth / 2, 0, 2*Math.PI);
					c.closePath();
					c.fill();
					c.stroke();
				}
			},
			{
				name: "Basic Turret",
				cost: 0,
				size: 1,
				mouse: true,
				buildable: true,
				shape: shape.circle,
				description: "A regular turret with a single gun",
				top: function(c, x, y, size, angle, rotation, material) {
					var actualGunWidth = size * gunWidth;

					c.beginPath();
					c.fillStyle = gunMaterial;
					c.strokeStyle = shadeColor(gunMaterial, lineShade);

					c.save();
					c.translate(x, y);
					c.rotate(angle);
					c.fillRect(-actualGunWidth / 2, 0, actualGunWidth, actualGunWidth * 2);
					c.strokeRect(-actualGunWidth / 2, 0, actualGunWidth, actualGunWidth * 2);
					c.restore();

					c.arc(x, y,(size / 2) - c.lineWidth / 2, 0, 2*Math.PI);
					c.closePath();
					c.fill();
					c.stroke();
				},
				bottom: function(c, x, y, size, angle, rotation, material) {
					unitTypes[unitType.basicUnit].bottom(c, x, y, size, angle, rotation, material);
				}
			},
			{
				name: "Sniper Turret",
				cost: 0,
				size: 1,
				mouse: true,
				buildable: true,
				shape: shape.circle,
				description: "A long-range gunner which shoots fast projectiles",
				top: function(c, x, y, size, angle, rotation, material) {
					var actualGunWidth = size * sniperGunWidth;
					var actualGunHeight = actualGunWidth * sniperGunHeight;

					c.beginPath();
					c.fillStyle = gunMaterial;
					c.strokeStyle = shadeColor(gunMaterial, lineShade);

					c.save();
					c.translate(x, y);
					c.rotate(angle);
					c.fillRect(-actualGunWidth / 2, 0, actualGunWidth, actualGunHeight);
					c.strokeRect(-actualGunWidth / 2, 0, actualGunWidth, actualGunHeight);
					c.restore();

					c.arc(x, y,(size / 2) - c.lineWidth / 2, 0, 2*Math.PI);
					c.closePath();
					c.fill();
					c.stroke();
				},
				bottom: function(c, x, y, size, angle, rotation, material) {
					unitTypes[unitType.basicUnit].bottom(c, x, y, size, angle, rotation, material);
				}
			},
			{
				name: "Twin Turret",
				cost: 0,
				size: 1,
				mouse: true,
				buildable: true,
				shape: shape.circle,
				description: "A turret with two guns, which fire small bullets",
				top: function(c, x, y, size, angle, rotation, material) {
					var actualGunWidth = (size / 2) - c.lineWidth;
					var actualGunHeight = size * gunWidth * 2;

					c.beginPath();
					c.fillStyle = gunMaterial;
					c.strokeStyle = shadeColor(gunMaterial, lineShade);

					c.save();
					c.translate(x, y);
					c.rotate(angle);
					c.fillRect(-actualGunWidth, 0, actualGunWidth, actualGunHeight);
					c.strokeRect(-actualGunWidth, 0, actualGunWidth, actualGunHeight);
					c.fillRect(0, 0, actualGunWidth, actualGunHeight);
					c.strokeRect(0, 0, actualGunWidth, actualGunHeight);
					c.restore();

					c.arc(x, y,(size / 2) - c.lineWidth / 2, 0, 2*Math.PI);
					c.closePath();
					c.fill();
					c.stroke();
				},
				bottom: function(c, x, y, size, angle, rotation, material) {
					unitTypes[unitType.basicUnit].bottom(c, x, y, size, angle, rotation, material);
				}
			},
			{
				name: "Cannon Turret",
				cost: 0,
				size: 1,
				mouse: true,
				buildable: true,
				shape: shape.circle,
				description: "A slow, but powerful gun capable of dealing hefty damage",
				top: function(c, x, y, size, angle, rotation, material) {
					var actualGunWidth = size * gunWidth * 1.4;
					var actualGunHeight = size * gunWidth * 2;

					c.beginPath();
					c.fillStyle = gunMaterial;
					c.strokeStyle = shadeColor(gunMaterial, lineShade);

					c.save();
					c.translate(x, y);
					c.rotate(angle);
					c.fillRect(-actualGunWidth / 2, 0, actualGunWidth, actualGunHeight);
					c.strokeRect(-actualGunWidth / 2, 0, actualGunWidth, actualGunHeight);
					c.restore();

					c.arc(x, y,(size / 2) - c.lineWidth / 2, 0, 2*Math.PI);
					c.closePath();
					c.fill();
					c.stroke();
				},
				bottom: function(c, x, y, size, angle, rotation, material) {
					unitTypes[unitType.basicUnit].bottom(c, x, y, size, angle, rotation, material);
				}
			},
			{
				name: "Healing Unit",
				cost: 0,
				size: 1,
				mouse: false,
				buildable: true,
				shape: shape.circle,
				description: "A support unit which heals connected units over time",
				top: function(c, x, y, size, angle, rotation, material) {},
				bottom: function(c, x, y, size, angle, rotation, material) {
					unitTypes[unitType.basicUnit].bottom(c, x, y, size, angle, rotation, material);

					var actualSize = size -(size * healingPadding);//healingPadding * cs;
					var thickness = actualSize * healingThickness / 2;
					c.fillStyle = healingMaterial;
					c.strokeStyle = shadeColor(healingMaterial, lineShade);
					c.beginPath();
					c.save();
					c.translate(x, y);
					c.rotate(rotation);
					c.moveTo(-thickness, -actualSize);
					c.lineTo(thickness, -actualSize);
					c.lineTo(thickness, -thickness);
					c.lineTo(actualSize, -thickness);
					c.lineTo(actualSize, thickness);
					c.lineTo(thickness, thickness);
					c.lineTo(thickness, actualSize);
					c.lineTo(-thickness, actualSize);
					c.lineTo(-thickness, thickness);
					c.lineTo(-actualSize, thickness);
					c.lineTo(-actualSize, -thickness);
					c.lineTo(-thickness, -thickness);
					c.lineTo(-thickness, -actualSize);
					c.restore();
					c.closePath();
					c.fill();
					c.stroke();
				}
			},
			{
				name: "Alchemy Lab",
				cost: 0,
				size: 1,
				mouse: false,
				buildable: true,
				shape: shape.circle,
				description: "An experimental unit which converts one resource to another",
				top: function(c, x, y, size, angle, rotation, material) {},
				bottom: function(c, x, y, size, angle, rotation, material) {
					unitTypes[unitType.basicUnit].bottom(c, x, y, size, angle, rotation, material);

					c.fillStyle = alchemyMaterial;
					c.strokeStyle = shadeColor(alchemyMaterial, lineShade);
					c.save();
					c.translate(x, y);
					c.rotate(rotation);

					for (var i = 0; i < 3; i++) {
						c.beginPath();
						var point = pfa(0, 0,(Math.PI * 2 / 3) * i, size * alchemyOrbMult);
						c.arc(point.x, point.y,(size / 3) - c.lineWidth / 2, 0, 2*Math.PI);
						c.closePath();
						c.fill();
						c.stroke();
					}

					c.restore();
				}
			},
			{
				name: "Booster Unit",
				cost: 0,
				size: 1,
				mouse: false,
				buildable: true,
				shape: shape.circle,
				description: "A unit which increases your overall speed",
				top: function(c, x, y, size, angle, rotation, material) {},
				bottom: function(c, x, y, size, angle, rotation, material) {
					unitTypes[unitType.basicUnit].bottom(c, x, y, size, angle, rotation, material);

					var actualSize = size * gearSize;
					c.fillStyle = gearMaterial;
					c.strokeStyle = shadeColor(gearMaterial, lineShade);
					c.save();
					c.translate(x, y);
					c.rotate(angle + rotation);

					c.beginPath();
					c.arc(0, 0, actualSize / 3 - c.lineWidth / 2, 0, 2*Math.PI);
					c.moveTo(actualSize - c.lineWidth / 2, 0);

					var angleInterval = (2*Math.PI) / gearTeethNum;
					for (var i = 0; i < gearTeethNum; i++) {
						var inset = 0;
						if (i % 2 != 0) {
							inset = gearInset * size;
						}
						c.arc(0, 0, actualSize - c.lineWidth / 2 - inset, angleInterval * i, angleInterval *(i + 1));
					}
					var point = pfa(0, 0, angleInterval, actualSize - c.lineWidth / 2 - inset);
					c.lineTo(actualSize - c.lineWidth / 2, 0);
					c.fill();
					c.stroke();
					c.closePath();

					c.fillStyle = materials[material];
					c.beginPath();
					c.arc(0, 0, actualSize / 3 - c.lineWidth, 0, 2*Math.PI);
					c.fill();
					c.closePath();

					c.restore();
				}
			},
			{
				name: "Octa Turret",
				cost: 0,
				size: 1,
				mouse: true,
				buildable: true,
				shape: shape.circle,
				description: "A turret with eight guns, that fire slowly but in every direction",
				top: function(c, x, y, size, angle, rotation, material) {
					var actualGunWidth = size * gunWidth;

					c.beginPath();
					c.fillStyle = gunMaterial;
					c.strokeStyle = shadeColor(gunMaterial, lineShade);

					for (var i = 0; i < 8; i++) {
						c.save();
						c.translate(x, y);
						c.rotate(angle +((Math.PI * 2) / 8) * i);
						c.fillRect(-actualGunWidth / 4, 0, actualGunWidth / 2, actualGunWidth * 2);
						c.strokeRect(-actualGunWidth / 4, 0, actualGunWidth / 2, actualGunWidth * 2);
						c.restore();
					}

					c.arc(x, y,(size / 2) - c.lineWidth / 2, 0, 2*Math.PI);
					c.closePath();
					c.fill();
					c.stroke();
				},
				bottom: function(c, x, y, size, angle, rotation, material) {
					unitTypes[unitType.basicUnit].bottom(c, x, y, size, angle, rotation, material);
				}
			},
			{
				name: "Spike",
				cost: 0,
				size: 0.5,
				mouse: false,
				buildable: false,
				shape: shape.triangle,
				description: "A small appendage which deals significant collision damage",
				top: function() {},
				bottom: function(c, x, y, size, angle, rotation, material) {
					size /= 2;
					c.fillStyle = materials[material];
					c.strokeStyle = shadeColor(materials[material], lineShade);
					c.save();
					c.translate(x, y);
					c.rotate(rotation);
					c.beginPath();
					c.moveTo(0, -size * cs + lineWidth * cs / 2);
					c.lineTo(-size * cs + lineWidth * cs / 2, size * cs - lineWidth * cs / 2);
					c.lineTo(size * cs - lineWidth * cs / 2, size * cs - lineWidth * cs / 2);
					c.lineTo(0, -size * cs + lineWidth * cs / 2);
					c.closePath();
					c.fill();
					c.stroke();
					c.restore();
					// unitTypes[unitType.basicUnit].bottom(c, x, y, size, angle, rotation, material);
				}
			}
		];

		var loadingText = g("loading");
		var menuElement = g("menu");
		var middleContainer = g("middle-container");
		var overlayElement = g("overlay");
		var mainCard = g("main");
		var titleElement = g("title");
		var playButton = g("play");
		var nameBox = g("name");
		var respawnInfo = g("respawn-info");
		var socialCard = g("social");
		var playerCountElement = g("count");
		var versionElement = g("version");
		var linksBar = g("links");
		var partyElement = g("party");
		var appsCard = g("apps");
		var helpBox = g("help");
		var helpBoxInner = g("help-inner");
		var hudElement = g("hud");
		var tipElement = g("tip");
		var alertsElement = g("alerts");
		var storeToggle = g("store-toggle");
		var toggleArrow = g("toggle-arrow-wrapper");
		var storeOuter = g("store");
		var storeBar = g("store-scroll");
		var stashElement = g("stash");
		var leftArrow = g("arrow-left");
		var rightArrow = g("arrow-right");
		var leftArrowWrapper = g("arrow-left-wrapper");
		var rightArrowWrapper = g("arrow-right-wrapper");
		var stashMainBox = g("stash-main");
		var stashSpecialBox = g("stash-special");
		var scoreBox = g("score");
		var optionsBox = g("options");
		var optionsHeading = g("options-heading");
		var optionsClose = g("options-close");
		var upgradeButton = g("upgrade-button");
		var destroyButton = g("destroy-button");
		var leaderboardBox = g("leaderboard");
		var scannerElement = g("scanner");
		var scanner = scannerElement.getContext("2d");
		var unitCounter = g("units");
		var minimapElement = g("minimap");
		minimapElement.width = mms;
		minimapElement.height = mms;
		var minimap = minimapElement.getContext("2d");
		var tutorialMobile = g("tutorial-mobile");
		var shareMessage = g("share-message");
		var discordButton = g("discord");
		var shareProgressOuter = g("share-progress-outer");
		var shareProgressInner = g("share-progress-inner");
		var deathCard = g("death");

		//Window resize handler
		var resize = function() {
			// if (mobile) {
			// 	canvas.width /= gameScale;
			// 	ch /= gameScale;
			// } else {
			// 	var dpr = window.devicePixelRatio || 1;
			// 	cw *= dpr;
			// 	ch *= dpr;
			// }
			// canvas.width = cw;
			// canvas.height = ch;
			dpr = window.devicePixelRatio || 1;
			canvas.style.width = window.innerWidth + "px";
			canvas.style.height = window.innerHeight + "px";
			canvas.width = window.innerWidth * dpr;
			canvas.height = window.innerHeight * dpr;
			game.scale(dpr, dpr);
			storeIconSize = originalStoreIconSize * dpr;
			stashIconSize = originalStashIconSize * dpr;
			w = window.innerWidth;
			h = window.innerHeight;
			rescale();
			resizeContent();
			game.lineCap = "round";
			game.lineJoin = "round";
			game.lineWidth = lineWidth * cs;
		};

		function resizeContent() {
			calculateScale();
			// middleContainer.style.transform = "translate(-50%, -100%) scale(" + gameScale + ")";
			middleContainer.style.transform = "translate(-50%, -50%) scale(" + gameScale + ")";
			appsCard.style.transform = "scale(" + gameScale + ")";
			appsCard.style.margin = (8 * gameScale) + "px";
			if (mobile) {
				appsCard.style.bottom = (92 * gameScale + 10 * gameScale) + "px";
			} else {
				appsCard.style.bottom = (92 * gameScale) + "px";
			}
			partyElement.style.transform = "scale(" + gameScale + ")";
			partyElement.style.margin = (8 * gameScale) + "px";
			partyElement.style.bottom = (8 * gameScale) + "px";
			playerCountElement.style.transform = "scale(" + gameScale + ")";
			playerCountElement.style.margin = (8 * gameScale) + "px";
			versionElement.style.transform = "scale(" + gameScale + ")";
			versionElement.style.margin = (8 * gameScale) + "px";
			storeOuter.style.transform = "translateX(-50%) scale(" + gameScale + ")";
			storeOuter.style.margin = (8 * gameScale) + "px";
			storeToggle.style.transform = "translateX(-100%) scale(" + gameScale + ")";
			storeToggle.style.margin = (8 * gameScale) + "px";
			if (mobile) {
				storeToggle.style.left = "calc(50% - " + (292 * gameScale) + "px - " + (8 * gameScale) + "px)";
			} else {
				storeToggle.style.left = "calc(50% - " + (460 * gameScale) + "px - " + (8 * gameScale) + "px)";
			}
			stashElement.style.transform = "scale(" + gameScale + ")";
			stashElement.style.margin = (8 * gameScale) + "px";
			stashMainBox.style.margin = "0px";
			stashSpecialBox.style.margin = "0px";
			stashSpecialBox.style.marginBottom = 8 + "px";
			unitCounter.style.transform = "scale(" + gameScale + ")";
			unitCounter.style.margin = (8 * gameScale) + "px";
			leaderboardBox.style.transform = "scale(" + gameScale + ")";
			leaderboardBox.style.margin = (8 * gameScale) + "px";
			scoreBox.style.transform = "scale(" + gameScale + ")";
			scoreBox.style.margin = (8 * gameScale) + "px";
			alertsElement.style.transform = "translateX(-50%) scale(" + gameScale + ")";
			alertsElement.style.bottom = (156 * gameScale) + "px";
			optionsBox.style.top = (8 * gameScale) + "px";
			optionsBox.style.transform = "translateX(-50%) scale(" + gameScale + ")";
			// if (socialCard) {
			// 	socialCard.style.transform = "scale(" + gameScale + ")";
			// 	socialCard.style.margin = (8 * gameScale) + "px";
			// 	socialCard.style.bottom = (8 * gameScale) + "px";
			// }
			linksBar.style.transform = "scale(" + gameScale + ")";
			linksBar.style.margin = (8 * gameScale) + "px";
			linksBar.style.bottom = (8 * gameScale) + "px";
			linksBar.style.maxWidth = "calc(50% - " + (200 * gameScale) + "px)";
			minimapElement.style.transform = "scale(" + gameScale + ")";
			minimapElement.style.margin = (8 * gameScale) + "px";
			minimapElement.style.bottom = (46 * gameScale) + "px";
			// g("ad-leaderboard").style.transform = "translateX(-50%) scale(" + gameScale + ")";
			// g("ad-leaderboard").style.top = (8 * gameScale) + "px";
			if (parse_query_string(window.location.search.substring(1)).source != "app") {
				if (mobile) {
					g("tanksmith-io_300x250").style.transform = "scale(" + gameScale + ")";
					g("tanksmith-io_300x250").style.left = "auto";
					g("tanksmith-io_300x250").style.right = (8 * gameScale) + "px";
					g("tanksmith-io_300x250").style.transformOrigin = "100% 100%";
				} else {
					var oldGameScale = gameScale;
					if (window.innerHeight > 800) {
						gameScale = 1;
					}
					g("tanksmith-io_300x250").style.transform = "translateX(-50%) scale(" + gameScale + ")";
					gameScale = oldGameScale;
				}
				g("tanksmith-io_300x250").style.bottom = (8 * gameScale) + "px";
			}
		}

		var menuScale = 0.6;
		var hudElements = hudElement.children;
		function rescale() {
			var ratio = w / h;
			if (ratio >= dr) {
				// Use width
				cs = w / dw;
			} else {
				// Use height
				cs = h / dh;
			}
			cs *= serverScale;
		}

		//Set handler and inital check
		window.onresize = resize;
		resize();

		var clientLast = Date.now();
		var serverLast = 1;
		var serverTargetDelta = 50;
		var serverDelta = serverTargetDelta;
		var unitLimit = Infinity;
		var floaterRegen = 0;
		var framesPerSend = 1;

		var Player = function(name, score) {
			this.name = filter(name);
			this.$score = score;
			this.score = score;
		}

		Player.prototype.update = function() {
			this.score = lerp(this.score, this.$score, 0.1);
		}

		var Obj = function(id, x, y, size, material) {
			this.id = id;
			this.$x = x;
			this.$ox = x;
			this.x = x;
			this.$y = y;
			this.$oy = y;
			this.y = y;
			this.size = size;
			this.material = material;
			this.dying = false;
			this.alpha = 1;
			this.scale = 1;
		}

		Obj.prototype.objUpdate = function(m) {
			if (this.dying) {
				this.alpha -= 0.1;
				this.scale += dissolveScale;
				this.x -= (this.$ox - this.$x) * m;
				this.y -= (this.$oy - this.$y) * m;
			} else {
				this.x = ferp(this.$ox, this.x, this.$x, m);
				this.y = ferp(this.$oy, this.y, this.$y, m);
			}
		}

		Obj.prototype.renderHealthBar = function() {
			var targetAlpha = 0;
			if (this.hp < 1) {
				targetAlpha = 1;
			}
			this.hpAlpha = lerp(this.hpAlpha, targetAlpha, hpAlphaSpeed);
			if (this.hpAlpha > 0.01) {
				drawHealthBar(fx(this.x), fy(this.y) +(this.size + healthBarPadding) * cs, this.hp, this.alpha * this.hpAlpha);
			}
		}

		var Unit = function(id, x, y, size, material, type, owner, angle, rotation, hp) {
			Obj.call(this, id, x, y, size, material);
			this.type = type;
			this.owner = owner;
			this.$angle = angle;
			this.angle = angle;
			this.$orotation = rotation;
			this.$rotation = rotation;
			this.rotation = rotation;
			this.$hp = hp;
			this.hp = hp;
			this.hpAlpha = 0;
			this.mouse = unitTypes[this.type].mouse;
			this.buildable = unitTypes[this.type].buildable;
			this.deleteAmount = Math.floor(linearScale(unitTypes[this.type].cost, this.material) / 2);
		}

		Unit.prototype = new Obj();

		Unit.prototype.update = function(m) {
			if (usingActualAngle || this.owner != self || !this.mouse) {
				var diff = Math.abs(this.$angle - this.angle);
				if (diff > Math.PI) {
					if (this.$angle > this.angle) {
						this.angle += Math.PI * 2;
					} else {
						this.angle -= Math.PI * 2;
					}
				}
				this.angle = lerp(this.angle, this.$angle, m);
			}
			this.rotation = ferp(this.$orotation, this.rotation, this.$rotation, m);
			this.hp = lerp(this.hp, this.$hp, 0.1);
			if (this.alpha <= 0) {
				var index = myUnits.indexOf(units[this.id]);
				if (index > -1) {
					myUnits.splice(index, 1);
				}
				delete units[this.id];
			}
		}

		Unit.prototype.renderBottom = function() {
			if (this.alpha < 1) {
				game.globalAlpha = this.alpha;
				if (usingFilter) {
					game.filter = blurFilter(this.alpha);
				}
			}
			unitTypes[this.type].bottom(game, fx(this.x), fy(this.y), this.size * this.scale * cs, this.angle, this.rotation, this.material);
			if (this.alpha < 1) {
				game.globalAlpha = 1;
				if (usingFilter) {
					game.filter = "blur(0px)";
				}
			}
		}

		Unit.prototype.renderTop = function() {
			if (this.alpha < 1) {
				game.globalAlpha = this.alpha;
				if (usingFilter) {
					game.filter = blurFilter(this.alpha);
				}
			}
			unitTypes[this.type].top(game, fx(this.x), fy(this.y), this.size * this.scale * cs, this.angle, this.rotation, this.material);
			if (this.alpha < 1) {
				game.globalAlpha = 1;
				if (usingFilter) {
					game.filter = "blur(0px)";
				}
			}
			if (debug) {
				game.fillStyle = "#f00";
				game.beginPath();
				game.arc(fx(this.$x), fy(this.$y), 10 * cs, 0, 2*Math.PI);
				game.fill();
				game.closePath();
			}
		}

		Unit.prototype.renderName = function() {
			var visible = true;
			if (this.owner == self) {
				var timeSinceJoined = Date.now() - timeJoined;
				if (timeSinceJoined < nameHideDelay + nameHideTime) {
					if (timeSinceJoined > nameHideDelay) {
						game.globalAlpha = 1 -(timeSinceJoined - nameHideDelay) / nameHideTime;
					}
				} else {
					visible = false;
				}
			} else {
				if (this.alpha < 1) {
					if (this.alpha > 0.01) {
						game.globalAlpha = this.alpha;
					} else {
						visible = false;
					}
				}
			}
			if (visible) {
				if (players[this.owner]) {
					game.fillStyle = nameFillColor;
					game.strokeStyle = nameStrokeColor;
					game.lineWidth = nameLineWidth * cs;
					game.textAlign = "center";
					game.font = "900 " + nameFontSize * cs + "px Ubuntu";
					var x = fx(this.x);
					var y = fy(this.y) -(this.size + namePadding) * cs;
					game.strokeText(players[this.owner].name, x, y);
					game.fillText(players[this.owner].name, x, y);
					game.font = "900 " +(nameFontSize / 2) * cs + "px Ubuntu";
					y += (nameFontSize / 2) * cs;
					var scoreText = formatScore(players[this.owner].score);
					game.strokeText(scoreText, x, y); // Comment for taking pics
					game.fillText(scoreText, x, y); // Comment for taking pics
					game.lineWidth = lineWidth * cs;
					game.globalAlpha = 1;
				}
			}
		}

		var Floater = function(id, x, y, size, material, rotation, hp) {
			Obj.call(this, id, x, y, size, material);
			this.$orotation = rotation;
			this.$rotation = rotation;
			this.rotation = rotation;
			this.$hp = hp;
			this.hp = hp;
			this.hpAlpha = 0;
			this.active = false;
		}

		Floater.prototype = new Obj();

		Floater.prototype.update = function(m) {
			if (this.alpha <= 0) {
				delete floaters[this.id];
			} else if (this.$x < -$ww / 2 || this.$x > $ww / 2 || this.$y < -$wh / 2 || this.$y > $wh / 2) {
				this.dying = true;
			} else {
				this.rotation = ferp(this.$orotation, this.rotation, this.$rotation, m);
				if (!this.active) {
					if (this.$hp < 1) {
						this.$hp += floaterRegen *(averageClientDelta / serverTargetDelta) * framesPerSend;
					}
				}
				this.hp = lerp(this.hp, this.$hp, 0.1);
			}
		}

		Floater.prototype.render = function() {
			if (this.alpha < 1) {
				game.globalAlpha = this.alpha;
				if (usingFilter) {
					game.filter = blurFilter(this.alpha);
				}
			}

			game.fillStyle = materials[this.material];
			game.strokeStyle = shadeColor(materials[this.material], lineShade);

			game.save();
			game.translate(fx(this.x), fy(this.y));
			game.rotate(this.rotation);
			game.beginPath();
			game.moveTo(0, -this.size * this.scale * cs + lineWidth * cs / 2);
			game.lineTo(-this.size * this.scale * cs + lineWidth * cs / 2, this.size * this.scale * cs - lineWidth * cs / 2);
			game.lineTo(this.size * this.scale * cs - lineWidth * cs / 2, this.size * this.scale * cs - lineWidth * cs / 2);
			game.lineTo(0, -this.size * this.scale * cs + lineWidth * cs / 2);
			game.closePath();
			game.fill();
			game.stroke();
			game.restore();

			if (debug) {
				if (this.active) {
					game.fillStyle = "#f00";
				} else {
					game.fillStyle = "#00f";
				}
				game.beginPath();
				game.arc(fx(this.$x), fy(this.$y), 10 * cs, 0, 2*Math.PI);
				game.fill();
				game.closePath();
			}

			if (this.alpha < 1) {
				game.globalAlpha = 1;
				if (usingFilter) {
					game.filter = "blur(0px)";
				}
			}
		}

		var Bullet = function(id, x, y, size, material) {
			Obj.call(this, id, x, y, size, material);
			this.firstFrame = true;
		}

		Bullet.prototype = new Obj();

		Bullet.prototype.update = function() {
			if (this.alpha <= 0) {
				delete bullets[this.id];
			}
		}

		Bullet.prototype.render = function() {
			if (this.alpha < 1) {
				game.globalAlpha = this.alpha;
				if (usingFilter) {
					game.filter = blurFilter(this.alpha);
				}
			}

			game.fillStyle = materials[this.material];
			game.strokeStyle = shadeColor(materials[this.material], lineShade);

			game.beginPath();
			game.arc(fx(this.x), fy(this.y), this.size * this.scale * cs - game.lineWidth / 2, 0, 2*Math.PI);
			game.closePath();
			game.fill();
			game.stroke();

			if (debug) {
				game.fillStyle = "#f00";
				game.beginPath();
				game.arc(fx(this.$x), fy(this.$y), 10 * cs, 0, 2*Math.PI);
				game.fill();
				game.closePath();
			}

			if (this.alpha < 1) {
				game.globalAlpha = 1;
				if (usingFilter) {
					game.filter = "blur(0px)";
				}
			}
		}

		var lastServerFrame = null;

		function setupNetwork(u) {
			console.log("Setting up the network for " + u);
			window.WebSocket = window.WebSocket || window.MozWebSocket;

			console.log(u);
			io = new WebSocket(u);
			io.binaryType = "arraybuffer";

			io.onopen = function() {
				console.log("Connected!");
				connected = true;

				var buffer = new ArrayBuffer(byte);
				var view = new DataView(buffer, 0);
				view.setUint8(0, clientCode.ready, true);
				io.send(buffer);
			};

			io.onclose = disconnect;
			io.onerror = disconnect;

			io.onmessage = function(message) {
				try {
					var buffer = message.data;
					var view = new DataView(message.data);
					var code = view.getUint8(0, true);
					var offset = byte;

					dataTotal += buffer.byteLength;
					dataInPeriod += buffer.byteLength;

					switch(code) {
						case serverCode.update:
							if (lastServerFrame != null) {
								serverDelta = lerp(serverDelta, Date.now() - lastServerFrame, 0.1);
								// serverDelta = Date.now() - lastServerFrame;
							}
							lastServerFrame = Date.now();

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
								if (hp < 0) {
									hp = 0;
								}
								offset += float;
								var rotation = view.getFloat32(offset, true);
								offset += float;

								unitList.push(id);

								if (Object.keys(units).indexOf(String(id)) > -1) {
									units[id].$ox = units[id].$x;
									units[id].$oy = units[id].$y;
									units[id].$x = x * ptmr;
									units[id].$y = y * ptmr;
									if (usingActualAngle || units[id].owner != self || !units[id].mouse) {
										units[id].$angle = angle;
									}
									units[id].$orotation = units[id].$rotation;
									units[id].$rotation = rotation;
									if (units[id].material != material) {
										units[id].deleteAmount = Math.floor(linearScale(unitTypes[units[id].type].cost, material) / 2);
									}
									units[id].material = material;
									units[id].$hp = hp;

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
										if (storage.tutorialStage == tutorial.gotUnit && units[id].type != unitType.core) {
											stashNotifyLocked = true;
											pushMessage("Awesome! You can now gather more resources to build your tank", longMessage);
											setTimeout(function() {
												var word = "click";
												if (mobile) {
													word = "tap";
												}
												pushMessage("Also, you can " + word + " one of your units to upgrade or destroy it", longMessage);
												setTimeout(function() {
													pushMessage("Protect your core: if it gets destroyed, your whole tank will get demolished", longMessage);
													setTimeout(function() {
														pushMessage("Good luck!", longMessage);
													}, tutorialDelay);
												}, longMessage + tutorialDelay);
											}, tutorialDelay);
											storage.tutorialStage++;
											saveStorage();
										}
									}
									updateUnitCounter();
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
									if (hp < 0) {
										hp = 0;
									}
									offset += float;
									if (Object.keys(floaters).indexOf(String(id)) > -1) {
										floaters[id].$ox = floaters[id].$x;
										floaters[id].$oy = floaters[id].$y;
										floaters[id].$x = x * ptmr;
										floaters[id].$y = y * ptmr;
										floaters[id].$orotation = floaters[id].$rotation;
										floaters[id].$rotation = rotation;
										floaters[id].$hp = hp;
										floaters[id].dying = false;
										floaters[id].alpha = 1;
										floaters[id].scale = 1;
									} else {
										floaters[id] = new Floater(id, x * ptmr, y * ptmr, size * ptmr, material, rotation, hp);
									}
									floaters[id].active = true;
								} else {
									// floaters[id].active = false;
									if (onScreen(floaters[id])) {
										floaters[id].dying = true;
									} else {
										delete floaters[id];
									}
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
									bullets[id].$ox = bullets[id].$x;
									bullets[id].$oy = bullets[id].$y;
									bullets[id].$x = x * ptmr;
									bullets[id].$y = y * ptmr;
									bullets[id].dying = false;
									bullets[id].firstFrame = false;
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
								var decodedString = defaultName;
								try {
									var encodedString = String.fromCharCode.apply(null, charArray);
									decodedString = decodeURIComponent(escape(atob(encodedString)));
								} catch(e) {}
								if (Object.keys(players).indexOf(String(id)) < 0) {
									players[id] = new Player(decodedString, ascore);
								} else {
									players[id].$score = ascore;
								}
							}

							for (id in units) {
								if (unitList.indexOf(Number(id)) < 0) {
									if (units[id].owner == self) {
										updateUnitCounter();
									}
									if (onScreen(units[id])) {
										units[id].dying = true;
									} else {
										var index = myUnits.indexOf(units[id]);
										if (index > -1) {
											myUnits.splice(index, 1);
										}
										delete units[id];
									}
								}
							}

							for (id in floaters) {
								if (floaterList.indexOf(Number(id)) < 0) {
									floaters[id].active = false;
									// if (onScreen(floaters[id])) {
									// 	floaters[id].dying = true;
									// } else {
									// 	delete floaters[id];
									// }
								}
							}

							for (id in bullets) {
								if (bulletList.indexOf(Number(id)) < 0) {
									if (onScreen(bullets[id])) {
										bullets[id].dying = true;
									} else {
										delete bullets[id];
									}
								}
							}

							break;
						case serverCode.joined:
							joined();
							break;
						case serverCode.info:
							ptmr = view.getFloat32(offset + float + float, true);
							lineWidth = originalLineWidth * ptmr;
							game.lineWidth = lineWidth * cs;
							$ww = view.getFloat32(offset, true) * ptmr;
							offset += float;
							$wh = view.getFloat32(offset, true) * ptmr;
							ww = $ww;
							wh = $wh;
							cx = ww / 2;
							cy = wh / 2;
							offset += float + float;
							self = view.getUint16(offset, true);
							offset += short;
							serverTargetDelta = view.getFloat32(offset, true);
							serverDelta = serverTargetDelta;
							offset += float;
							unitLimit = view.getUint32(offset, true);
							offset += int;
							floaterRegen = view.getFloat32(offset, true);
							offset += float;
							framesPerSend = view.getUint8(offset, true);
							offset += byte;
							for (var i = 0; i < unitTypes.length; i++) {
								unitTypes[i].cost = view.getInt32(offset, true);
								offset += int;
							}
							sortUnitTypes();
							players[self] = new Player(nameBox.value, 0);
							populateStore();
							console.log("Showing menu");
							hideLoadingText();
							showMenu();
							lastServerFrame = null;
							break;
						case serverCode.stash:
							var notify = view.getUint8(offset);
							if (notify) {
								notify = !stashNotifyLocked;
								stashNotifyLocked = false;
							}
							offset += byte;
							for (var i = 0; i < materialNum; i++) {
								var old = $stash[i];
								$stash[i] = view.getInt32(offset + int * i, true);
								if ($stash[i] != old) {
									if (notify) {
										var diff = $stash[i] - old;
										if (diff < 0) {
											pushMessage(formatScore(diff) + " " + materialNames[i], shortMessage);
										} else {
											pushMessage("+" + formatScore(diff) + " " + materialNames[i], shortMessage);
										}
									}
									if (storage.tutorialStage == tutorial.saveUp) {
										pushMessage("Well done! Next, save up some Wood", longMessage);
										setTimeout(function() {
											pushMessage("Soon, you'll be able to start building units", longMessage);
											stashNotifyLocked = true;
										}, tutorialDelay);
										storage.tutorialStage++;
										saveStorage();
									}
								}
							}
							$score = view.getInt32(offset + int * i, true);
							updateStore();
							break;
						case serverCode.scale:
							$serverScale = view.getFloat32(offset, true);
						case serverCode.leaderboard:
							var html = "<table>";
							var num = view.getInt32(offset, true);
							offset += int; // number
							var dataSize = short + int + byte; // id, score, name length

							if (mobile && num > mobileLeaderboardNum) {
								num = mobileLeaderboardNum;
							}

							for (var i = 0; i < num; i++) {
								var id = view.getUint16(offset, true);
								var ascore = view.getInt32(offset + short, true);
								var nameLength = view.getUint8(offset + short + int, true);
								var charArray = [];
								for (var j = 0; j < nameLength; j++) {
									charArray.push(view.getInt8(offset + short + int + byte + j, true));
								}
								var decodedString = defaultName;
								try {
									var encodedString = String.fromCharCode.apply(null, charArray);
									decodedString = decodeURIComponent(escape(atob(encodedString)));
								} catch(e) {}
								if (decodedString == "") {
									decodedString = defaultName;
								}
								offset += dataSize + nameLength;
								html += "<tr";
								if (id == self) {
									html += " class=\"me\"";
								}
								html += "><td class=\"left\"><div class=\"truncate\">" +(i + 1) + ". " + filter(decodedString) + "</div></td><td class=\"right\">" + formatScore(ascore) + "</td></tr>";
							}
							html += "</table>";
							leaderboardBox.innerHTML = html;
							leaderboardBox.style.opacity = "1";
							break;
						case serverCode.die:
							showInterstitial();
							createBanner();
							if (!debug && parse_query_string(window.location.search.substring(1)).source != "app") {
								aiptag.cmd.display.push(function() { aipDisplayTag.refresh('tanksmith-io_300x250'); });
							}
							var nameLength = view.getUint8(offset, true);
							offset += byte;
							var charArray = [];
							for (var j = 0; j < nameLength; j++) {
								charArray.push(view.getInt8(offset + j, true));
							}
							var decodedString = defaultName;
							try {
								var encodedString = String.fromCharCode.apply(null, charArray);
								decodedString = decodeURIComponent(escape(atob(encodedString)));
							} catch(e) {}
							if (decodedString == "") {
								decodedString = defaultName;
							}
							var noun = "players";
							if (kills == 1) {
								noun = "player";
							}
							// deathCard.style.display = "block";
							deathCard.innerHTML = "<h3>Destroyed by " + decodedString + "</h3><span class=\"minor\">You achieved a </span>score of " + formatScore($score) + "<span class=\"minor\"> and </span>destroyed " + kills + " " + noun + " <span class=\"minor\">in </span>" + formatTime(Date.now() - timeJoined) + "<span class=\"minor\">.</span>";
							if (!mobile) {
								deathCard.innerHTML += " <a class=\"twitter-share-button\" href=\"https://twitter.com/intent/tweet?original_referer=http%3A%2F%2Ftanksmith.io%2F&ref_src=twsrc%5Etfw&text=I%20played%20Tanksmith.io:%20achieved%20a%20score%20of%20" + formatScore($score) + "%20and%20destroyed%20" + kills + "%20" + noun + "%20in%20" + formatTime(Date.now() - timeJoined) + "%20%23tanksmithio%20%23ioninja%20%23iogames%20via%20%40ioninja14\">Tweet</a> this.";
							}

							var info = [];
							for (var i = 0; i < $stash.length; i++) {
								if ($stash[i] > 0) {
									var respawnAmount = 0;
									var socialTotal = Math.floor((storage.socialButtons.length * socialBonus) / Math.pow(2, i));
									if ($stash[i] <= socialTotal) {
										respawnAmount = socialTotal;
									} else {
										respawnAmount = Math.floor(($stash[i] - socialTotal) / 2) + socialTotal;
									}
									if (respawnAmount > 0) {
										info.push(formatScore(respawnAmount) + "&nbsp;<span class=\"minor\">" + materialNames[i] + "</span>");//" <img src=\"" + materialIcons[i] + "\" width=\"" + originalStashIconSize + "px\" style=\"position:relative;top:1.5px;\">");
									}
								}
							}

							if (info.length == 0) {
								respawnInfo.style.display = "none";
							} else {
								respawnInfo.style.display = "block";
								var string = "<span class=\"minor\">Respawn with</span> ";
								if (info.length == 1) {
									string += info[0];
								} else if (info.length == 2) {
									string += info.join(" <span class=\"minor\">and</span> ");
								} else {
									var last = info.splice(info.length - 1, 1);
									string += info.join("<span class=\"minor\">, </span>");
									string += " <span class=\"minor\">and</span> " + last;
								}
								respawnInfo.innerHTML = string;
							}

							die();
							showMenu();
							break;
						case serverCode.shake:
							// shaking = true;
							// setTimeout(function() {
							// 	shaking = false;
							// }, shakeTime);
							break;
						case serverCode.kill:
							var nameLength = view.getUint8(offset, true);
							offset += byte;
							var charArray = [];
							for (var j = 0; j < nameLength; j++) {
								charArray.push(view.getInt8(offset + j, true));
							}
							var decodedString = defaultName;
							try {
								var encodedString = String.fromCharCode.apply(null, charArray);
								decodedString = decodeURIComponent(escape(atob(encodedString)));
							} catch(e) {}
							if (decodedString == "") {
								decodedString = defaultName;
							}
							kills++;
							pushMessage("You destroyed " + decodedString, shortMessage);
							break;
						case serverCode.resize:
							$ww = view.getFloat32(offset, true) * ptmr;
							$wh = view.getFloat32(offset + float, true) * ptmr;
							break;
					}
				} catch(e) {}
			}
		}

		function disconnect() {
			console.log("Disconnected!");
			respawnInfo.style.display = "none";
			hideCanvas();
			hideMenu(false);
			showLoadingText();
			die();
			io = null;
			connected = false;
			running = false;
			players = {};
			units = {};
			bullets = {};
			floaters = {};
			myUnits = [];
			deathCard.style.display = "none";
			onDisconnect();
		}

		//On mousedown, emit
		var mouseDown = function(e) {
			if (playing && !placing) {
				key(1, 1); // 1 refers to left mouse
			}
		};

		//On mouseup, emit
		var mouseUp = function(e) {
			key(1, 0); // 1 refers to left mouse
		};

		var mouseClick = function(e) {
			if (playing) {
				if (!placing) {
					selectedUnit = raycastUnit(e.clientX, e.clientY);
					updateOptionsBox();
				} else if (placing && !placingWithin && myUnits.length <= unitLimit && linearScale(unitTypes[placingType].cost, placingMaterial) <= $stash[placingMaterial]) {
					if (myUnits.length <= unitLimit) {
						if (!controlKey) {
							placing = false;
						}
						var buffer = new ArrayBuffer(byte + short + byte + byte + float); // code, parent id, type, material, angle
						var view = new DataView(buffer, 0);
						var offset = 0;
						view.setUint8(0, clientCode.build, true);
						view.setUint16(byte, placingOn, true);
						view.setUint8(byte + short, placingType, true);
						view.setUint8(byte + short + byte, placingMaterial, true);
						view.setFloat32(byte + short + byte + byte, placingAngle, true);
						io.send(buffer);
					} else {
						pushMessage("You have built the maximum number of units", longMessage);
						pushMessage("Delete existing units with the K key to build more", longMessage);
					}
				}
			}
		}

		var tipOn = false;
		var tipPadding = 10;

		//On mousemove, emit
		var mouseMove = function(e) {
			mx = e.pageX;
			my = e.pageY;
			if (connected && playing && selfCore != null && !usingActualAngle) {
				updateRotation();
			}
			if (tipOn) {
				tipElement.style.left = e.clientX;
				tipElement.style.top = e.clientY - tipPadding;
			}
		};

		var sendMouse = function() {
			amx = Math.round((mx - fx(selfCore.x)) / cs);
			amy = Math.round((my - fy(selfCore.y)) / cs);
			if (selfCore != null && lmx != amx && lmy != amy) {
				var buffer = new ArrayBuffer(byte + int + int);
				var view = new DataView(buffer, 0);
				view.setUint8(0, clientCode.mouse, true);
				view.setInt32(byte, amx, true);
				view.setInt32(byte + int, amy, true);
				io.send(buffer);
				lmx = amx;
				lmy = amy;
			}
		}

		var sendMove = function() {
			if (lastJoystickAngle != joystickAngle || lastJoystickPower != joystickPower) {
				var buffer = new ArrayBuffer(byte + float + float);
				var view = new DataView(buffer, 0);
				view.setUint8(0, clientCode.move, true);
				view.setFloat32(byte, joystickAngle, true);
				view.setFloat32(byte + float, joystickPower, true);
				io.send(buffer);
				lastJoystickAngle = joystickAngle;
				lastJoystickPower = joystickPower;
			}
		}

		// Handlers
		canvas.onmousedown = mouseDown;
		canvas.onmouseup = mouseUp;
		if (!mobile) {
			canvas.onclick = mouseClick;
		}
		document.addEventListener("mousemove", mouseMove, true);
		if (!mobile) {
			storeBar.onmouseleave = itemMouseLeave;
		}
		window.oncontextmenu = function(e) {
			// e.preventDefault();
			// return false;
		}

		if (mobile) {
			canvas.addEventListener("touchstart", function(e) {
				for (var i = 0; i < e.changedTouches.length; i++) {
					var t = e.changedTouches[i];
					var px = t.pageX;
					var py = t.pageY;
					if (raycastUnit(px, py) == null) {
						if (px < w / 2) {
							joystickDown = true;
							joystickStartX = px;
							joystickStartY = py;
							joystickX = joystickStartX;
							joystickY = joystickStartY;
							joystickPos = {x: joystickX, y: joystickY};
						} else {
							targetDown = true;
							targetStartX = px;
							targetStartY = py;
							$targetOffsetX = 0;
							$targetOffsetY = 0;
							targetOffsetX = 0;
							targetOffsetY = 0;
							targetLastOffsetX = 0;
							targetLastOffsetY = 0;
							mx = w / 2;
							my = h / 2;
							if (!placing) {
								key(1, 1);
							}
						}
					}
				}
				e.preventDefault();
				return false;
			}, false);

			canvas.addEventListener("touchmove", function(e) {
				for (var i = 0; i < e.changedTouches.length; i++) {
					var t = e.changedTouches[i];
					var px = t.pageX;
					var py = t.pageY;
					if (px < w / 2) {
						if (joystickDown) {
							joystickX = px;
							joystickY = py;
							joystickAngle = afp(joystickStartX, joystickStartY, joystickX, joystickY);
							joystickDistance = dfp(joystickStartX, joystickStartY, joystickX, joystickY);
							if (joystickDistance > joystickSize) {
								joystickPos = pfa(joystickStartX, joystickStartY, joystickAngle, joystickSize);
							} else {
								joystickPos = {x: joystickX, y: joystickY};
							}
							joystickPower = joystickDistance / joystickSize;
							if (joystickPower > 1) {
								joystickPower = 1;
							}
							if (storage.tutorialStage == tutorial.click) {
								setTimeout(function() {
									pushMessage("Touch the right side of the screen, and move to adjust your target", longMessage);
								}, tutorialDelay);
								storage.tutorialStage++;
								saveStorage();
							}
						} else {
							targetDown = false;
							key(1, 0);
						}
					} else {
						if (targetDown) {
							targetLastOffsetX = $targetOffsetX;
							targetLastOffsetY = $targetOffsetY;
							$targetOffsetX = (px - targetStartX) * targetSensitivity;
							$targetOffsetY = (py - targetStartY) * targetSensitivity;
						} else {
							joystickDown = false;
							joystickPower = 0;
						}
					}
				}
				e.preventDefault();
				return false;
			}, false);

			var touchEnd = function(e) {
				for (var i = 0; i < e.changedTouches.length; i++) {
					var t = e.changedTouches[i];
					var px = t.pageX;
					var py = t.pageY;
					if (px < w / 2) {
						joystickDown = false;
						joystickAngle = 0;
						joystickPower = 0;
					} else {
						targetDown = false;
						key(1, 0);
					}
				}
				mouseClick({clientX: px, clientY: py});
				e.preventDefault();
				return false;
			}

			canvas.addEventListener("touchend", touchEnd, false);
			canvas.addEventListener("touchcancel", touchEnd, false);

			storeBar.style.overflowX = "scroll";
			storeBar.onscroll = function(e) {
				if (!scriptScrollTrigger) {
					$storeBarScroll = storeBar.scrollLeft;
					storeBarScroll = $storeBarScroll;
				}
				scriptScrollTrigger = false;
			}

			nameBox.onclick = function(e) {
				nameBox.value = prompt("Enter name");
				e.preventDefault;
				return false;
			}

			try {
				for (var si in document.styleSheets) {
					var styleSheet = document.styleSheets[si];
					if (!styleSheet.rules) continue;
					for (var ri = styleSheet.rules.length - 1; ri >= 0; ri--) {
						if (!styleSheet.rules[ri].selectorText) continue;
						if (styleSheet.rules[ri].selectorText.match(":hover")) {
							styleSheet.deleteRule(ri);
						}
					}
				}
			} catch(e) {}

			stashIconLineWidth *= dpr;

			linksBar.style.display = "none";
			partyElement.style.fontSize = "25px";
			versionElement.style.fontSize = "25px";
			playerCountElement.style.fontSize = "25px";
			storeOuter.style.width = "584px";
			storeBar.style.width = "504px";
			if (app) {
				appsCard.style.display = "none";
			} else {
				// g("middle-column").appendChild(appsCard);
				// appsCard.style.position = "relative";
				// appsCard.style.left = "auto";
				// appsCard.style.bottom = "auto";
				// appsCard.style.transform = "none";
				// appsCard.className += " main";
				// g("app-ios").style.height = "54px";
				g("app-android").style.height = "54px";
				appsCard.style.height = "54px";
			}

			helpBox.style.position = "fixed";
			helpBox.style.left = "50%";
			helpBox.style.top = "-200%";
			helpBox.style.transform = "translate(-50%,-50%)";
			helpBox.style.zIndex = "999";
			helpBox.style.width = "374px";
			helpBox.style.height = "294px";
			helpBox.style.fontSize = "25px";
			helpBoxInner.style.height = "232px";
			g("help-heading").style.fontSize = "35px";
			g("help-inner").innerHTML = "Touch the left side of the screen, and move <span class=\"minor\">to control your tank</span><br>Touch the right side of the screen, and move <span class=\"minor\">to aim</span><br>Protect your core <span class=\"minor\">to stay alive</span><br>Destroy shapes <span class=\"minor\">to collect resources</span><br>Select a unit from the store <span class=\"minor\">and tap to place it</span><br>Collect better resources <span class=\"minor\">to build better units</span><br>Tap a unit in your tank <span class=\"minor\">to upgrade or destroy it</span><br>Assemble your tank <span class=\"minor\">to become powerful</span><br>Battle other players <span class=\"minor\">and climb the leaderboard</span><div id=\"close-tutorial\" style=\"width:100%;text-align:right\"><a href=\"#\">Close tutorial</a></div>";
			g("social-column").remove();
			tutorialMobile.style.display = "block";
			tutorialMobile.onclick = function() {
				helpBoxInner.scrollTop = 0;
				helpBox.style.top = "50%";
			}
			g("close-tutorial").onclick = function() {
				helpBox.style.top = "-200%";
			}
		}

		var storeItemWidth = 168;
		function onWheel(deltaY) {
			var n = storeItemWidth;
			if (deltaY < 0) {
				n *= -1;
			}
			$storeBarScroll += n;
			if ($storeBarScroll < 0) {
				$storeBarScroll = 0;
			}
			var max = storeBar.scrollWidth - storeBar.clientWidth;
			if ($storeBarScroll > max) {
				$storeBarScroll = max;
			}
		}

		storeBar.onwheel = function(e) {
			onWheel(e.deltaY);
		}

		var leftArrowDown = false;
		var rightArrowDown = false;
		var arrowHoldDelay = 250;

		var leftArrowWrapperDown = function() {
			leftArrowDown = true;
			onWheel(-1);
			setTimeout(doScroll.bind(null, -1), arrowHoldDelay);
		}

		var rightArrowWrapperDown = function() {
			rightArrowDown = true;
			onWheel(1);
			setTimeout(doScroll.bind(null, 1), arrowHoldDelay);
		}

		var leftArrowWrapperUp = function() {
			leftArrowDown = false;
		}

		var rightArrowWrapperUp = function() {
			rightArrowDown = false;
		}

		if (mobile) {
			leftArrowWrapper.ontouchstart = leftArrowWrapperDown;
			rightArrowWrapper.ontouchstart = rightArrowWrapperDown;
			leftArrowWrapper.ontouchend = leftArrowWrapperUp;
			rightArrowWrapper.ontouchend = rightArrowWrapperUp;
			leftArrowWrapper.ontouchcancel = leftArrowWrapperUp;
			rightArrowWrapper.ontouchcancel = rightArrowWrapperUp;
		} else {
			leftArrowWrapper.onmousedown = leftArrowWrapperDown;
			rightArrowWrapper.onmousedown = rightArrowWrapperDown;
			leftArrowWrapper.onmouseup = leftArrowWrapperUp;
			rightArrowWrapper.onmouseup = rightArrowWrapperUp;
		}

		function doScroll(type) {
			if (type == -1) {
				if (leftArrowDown) {
					resolveScroll(type);
				}
			} else if (type == 1) {
				if (rightArrowDown) {
					resolveScroll(type);
				}
			}
		}

		function resolveScroll(type) {
			onWheel(type);
			setTimeout(doScroll.bind(null, type), arrowHoldDelay);
		}

		function key(code, state, force) {
			var oldState = 0;
			if (keyStates[code] != undefined) {
				oldState = keyStates[code];
			}
			keyStates[code] = state;
			if (code == 17) {
				controlKey = state;
			} else if (code == 27) {
				placing = false;
			} else if (code == 69 && state == 0) {
				autoFire = !autoFire;
				if (autoFire) {
					key(1, 1);
				} else {
					key(1, 0, 1);
				}
			} else if (!(code == 1 && state == 0 && autoFire)) {
				if (connected && keysCodes.indexOf(code) > -1 &&(force || state != oldState)) {
					if (storage.tutorialStage == tutorial.click && code != 1 && code != 2) {
						setTimeout(function() {
							pushMessage("Left-mouse click to fire", longMessage);
						}, tutorialDelay);
						storage.tutorialStage++;
						saveStorage();
					} else if (storage.tutorialStage == tutorial.shapes &&(code == 1 || code == 2)) {
						setTimeout(function() {
							pushMessage("Destroy shapes to gather resources", longMessage);
						}, tutorialDelay);
						storage.tutorialStage++;
						saveStorage();
					}
					var buffer = new ArrayBuffer(byte + byte + byte);
					var view = new DataView(buffer, 0);
					view.setUint8(0, clientCode.key, true);
					view.setUint8(1, code, true);
					view.setUint8(2, state, true);
					io.send(buffer);
				}
			}
		}

		//On keydown...
		document.onkeydown = function(e) {
			if (playing) {
				key(e.keyCode, 1);
			}
		};

		//On keyup...
		document.onkeyup = function(e) {
			if (playing) {
				key(e.keyCode, 0);
			}
		};

		continueToPlay = function() {
			storage.name = nameBox.value;
			saveStorage();
			var string = btoa(unescape(encodeURIComponent(nameBox.value)));
		    var charList = string.substring(0, nameMax).split("");
			var buffer = new ArrayBuffer(byte + byte + byte + charList.length);
			var view = new DataView(buffer, 0);
			view.setUint8(0, clientCode.play, true);
			view.setUint8(1, charList.length, true);
			view.setUint8(2, storage.socialButtons.length, true);
			var offset = byte + byte + byte;
			// for (var i = 0; i < nameBox.value.length; i++) {
			// 	view.setUint8(offset + i, nameBox.value.charCodeAt(i), true);
			// }
		    for (var i = 0; i < charList.length; i++) {
				view.setUint8(offset + i, charList[i].charCodeAt(0), true);
		    }
			io.send(buffer);
			players[self].name = filter(nameBox.value);
			hasPlayed = true;
		}

		function showVideoAd() {
			console.log("Calling video ad");
			aiptag.cmd.player.push(function() { adplayer.startPreRoll(); });
			// continueToPlay();
		}

		//On play button being clicked...
		function play() {
			if (io) {
				// if (!mobile) {
			    if (parse_query_string(window.location.search.substring(1)).source != "app" && !debug && (playCount - 1) % 3 == 0) {
					showVideoAd();
				} else {
					continueToPlay();
				}
				playCount++;
			};
		};

		function joined() {
			setTimeout(function() {
				removeBanner();
				prepareInterstitial();
				playing = true;
				timeJoined = Date.now();
				updateStashBox(stash, score);
				lastServerFrame = null;
				serverScale = 0.5;
				storage.first = false;
				saveStorage();
				showCanvas();
				hideMenu(true);
				if (storage.tutorialStage == tutorial.wasd) {
					setTimeout(function() {
						if (mobile) {
							pushMessage("Touch the left side of the screen, and move to control your tank", longMessage)
						} else {
							pushMessage("WASD or arrow keys to move", longMessage);
						}
					}, tutorialDelay);
					storage.tutorialStage++;
					saveStorage();
				}
			}, serverTargetDelta);
		}

		function die() {
			playing = false;
			selfCore = null;
			canClearFloaters = false;
			kills = 0;
			tipElement.style.display = "none";
			tipElement.style.opacity = "0";
		}

		function hideMenu(showHud) {
			menuElement.style["opacity"] = "0";
			middleContainer.style["transition-timing-function"] = "ease-in";
			middleContainer.style["top"] = "-50%";
			if (showHud) {
				hudElement.style["opacity"] = "1";
			} else {
				hudElement.style["opacity"] = "0";
			}
			setTimeout(function() {
				if (playing) {
					if (menuElement.style.opacity == "0") {
						menuElement.style.display = "none";
					}
				}
			}, 1500);
		}

		function showMenu() {
			menuElement.style.display = "block";
			var temp = menuElement.clientHeight; // Force fade
			menuElement.style["opacity"] = "1";
			middleContainer.style["transition-timing-function"] = "ease-out";
			// middleContainer.style["top"] = "calc(100% - 250px - 16px)";
			middleContainer.style["top"] = "50%";
			hudElement.style["opacity"] = "0";
		}

		function hideLoadingText() {
			loadingText.style["opacity"] = "0";
			setTimeout(function() {
				loadingText.style["visibility"] = "hidden";
			}, 1500);
		}

		function showLoadingText() {
			loadingText.style["visibility"] = "visible";
			loadingText.style["opacity"] = "1";
		}

		function hideCanvas() {
			canvas.style.opacity = 0;
		}

		function showCanvas() {
			canvas.style.opacity = 1;
		}

		game.lineCap = "round";
		game.lineJoin = "round";
		game.lineWidth = lineWidth * cs;

		var lastUpdateFrame = Date.now();
		var lerpMult = 1;

		var lelid = Date.now();

		//Render and update frame
		var update = function() {
			var clientDelta = Date.now() - lastUpdateFrame;
			averageClientDelta = (averageClientDelta + clientDelta) / 2;
			lerpMult = clientDelta / serverDelta;
			if (lerpMult > 1) {
				lerpMult = 1;
			}
			lastUpdateFrame = Date.now();

			for (u in units) {
				units[u].objUpdate(lerpMult);
				units[u].update(lerpMult);
			}

			if (selfCore != null) {
				updateCamera(clientDelta);
				updateScroll();
			}

			ww = lerp(ww, $ww, 0.1);
			wh = lerp(wh, $wh, 0.1);
			background();

			score = lerp(score, $score, 0.1);

			for (var i = 0; i < materialNum; i++) {
				stash[i] = lerp(stash[i], $stash[i], 0.1);
			}

			updateStashBox();

			if (!usingActualAngle) {
				updateRotation();
			}

			for (p in players) {
				players[p].update();
			}

			for (f in floaters) {
				floaters[f].objUpdate(lerpMult);
				floaters[f].update(lerpMult);
				if (floaters[f] != null && onScreen(floaters[f])) {
					floaters[f].render();
				}
			}

			for (u in units) {
				units[u].renderBottom();
			}

			for (b in bullets) {
				bullets[b].objUpdate(lerpMult);
				bullets[b].update();
				if (bullets[b] != null && !bullets[b].firstFrame) {
					bullets[b].render();
				}
			}

			if (placing) {
				updatePlacing();
			} else {
				if (raycastUnit(mx, my)) {
					canvas.style.cursor = "pointer";
				} else {
					canvas.style.cursor = "crosshair";
				}
			}

			for (p in units) {
				units[p].renderTop();
			}

			for (u in units) {
				if (units[u].type == unitType.core) {
					units[u].renderName();
				}
			}

			for (f in floaters) {
				floaters[f].renderHealthBar();
			}

			for (p in units) {
				units[p].renderHealthBar();
			}

			// if (selectedUnit) {
			// 	drawSelectedText();
			// }

			if (selfCore != null) {
				drawHalo();
				updateMinimap();
			}

			if (mobile) {
				if (joystickDown) {
					joystickAlpha += 0.1;
					if (joystickAlpha > 1) {
						joystickAlpha = 1;
					}
				} else {
					joystickAlpha -= 0.1;
					if (joystickAlpha < 0) {
						joystickAlpha = 0;
					}
				}

				if (targetDown) {
					targetIconAlpha += 0.1;
					if (targetIconAlpha > 1) {
						targetIconAlpha = 1;
					}
				} else {
					targetIconAlpha -= 0.1;
					if (targetIconAlpha < 0) {
						targetIconAlpha = 0;
					}
				}

				if (joystickAlpha > 0) {
					game.globalAlpha = 0.25 * joystickAlpha;
					game.fillStyle = "#000";
					game.beginPath();
					game.arc(joystickStartX, joystickStartY, joystickSize, 0, 2*Math.PI);
					game.fill();
					game.closePath();
					game.beginPath();
					game.arc(joystickPos.x, joystickPos.y, joystickSize / 2, 0, 2*Math.PI);
					game.fill();
					game.closePath();
					game.globalAlpha = 1;
				}

				if (targetIconAlpha > 0) {
					targetOffsetX = ferp(targetLastOffsetX, targetOffsetX, $targetOffsetX, 1 / targetSensitivity);
					targetOffsetY = ferp(targetLastOffsetY, targetOffsetY, $targetOffsetY, 1 / targetSensitivity);
					mx = w / 2 + targetOffsetX;
					my = h / 2 + targetOffsetY;
					game.lineCap = "butt";
					game.globalAlpha = 0.5 * targetIconAlpha;
					game.strokeStyle = "#000";
					var x = w / 2 + targetOffsetX;
					var y = h / 2 + targetOffsetY;
					game.beginPath();
					game.moveTo(x, y - targetSize);
					game.lineTo(x, y + targetSize);
					game.moveTo(x - targetSize, y);
					game.lineTo(x + targetSize, y);
					game.stroke();
					game.closePath();
					game.globalAlpha = 1;
					game.lineCap = "round";
				}

			}

			if (debug) {
				game.fillStyle = nameFillColor;
				game.strokeStyle = nameStrokeColor;
				game.lineWidth = nameLineWidth;
				game.textAlign = "left";
				game.font = "900 " + nameFontSize + "px Ubuntu";
				var x = 5;
				var y = 10 + nameFontSize / 2;
				var dataTotalText = "Data total: " + formatDataNumber(dataTotal);
				game.strokeText(dataTotalText, x, y);
				game.fillText(dataTotalText, x, y);
				y += nameFontSize;
				var dataPerPeriodText = "Data per second: " + formatDataNumber(dataPerPeriod);
				game.strokeText(dataPerPeriodText, x, y);
				game.fillText(dataPerPeriodText, x, y);
				y += nameFontSize;
				var fpsText = "Local FPS: " + fps;
				game.strokeText(fpsText, x, y);
				game.fillText(fpsText, x, y);
				y += nameFontSize;
				var serverFpsText = "Server FPS: " + Math.round(1000 / serverDelta);
				game.strokeText(serverFpsText, x, y);
				game.fillText(serverFpsText, x, y);
				game.lineWidth = lineWidth * cs;
			}

			if (running) {
				frame(update);
			} else if (io != null) {
				io.close();
			}
		};

		//Set animation frame caller
		var frame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;

		initStashBox();
		//First update
		update();
		// setupNetwork("ws://localhost:9002/");

		playButton.onclick = play;

		mouseInterval = setInterval(function() {
			if (playing && selfCore != null) {
				sendMouse();
				if (mobile) {
					sendMove();
				}
			}
		}, 30);

		if (debug) {
			debugInterval = setInterval(function() {
				dataPerPeriod = dataInPeriod;
				dataInPeriod = 0;
				fps = Math.round(1000 / averageClientDelta);
			}, 1000);
		}

		storeToggle.onclick = function() {
			var scale = 1;
			if (mobile) {
				scale = gameScale;
			}

			if (storeOuter.style.transform.indexOf("150%") == -1) {
				storeOuter.style.transform = "translateX(-50%) translateY(150%) scale(" + scale + ")";
				toggleArrow.style.top = "12.5%";
				toggleArrow.style.transform = "scaleY(-1)";
			} else {
				storeOuter.style.transform = "translateX(-50%) translateY(0%) scale(" + scale + ")";
				toggleArrow.style.top = "37.5%";
				toggleArrow.style.transform = "scaleY(1)";
			}
		}

		/*setTimeout(function() {
			var ad = document.querySelector("ins.adsbygoogle");
			if (!ad || ad.innerHTML == "") {
				console.log("We have detected that you are using adblock. Our only way to pay for server costs is by running ads. Please consider disabling adblock, as an easy and free way to support the game!");
				blocker = 1;
				abilityBox.disabled = true;
			};
		},500);*/

		function raycastUnit(x, y) {
			var unit = null;
			for (var i = 0; i < myUnits.length; i++) {
				if (dfp(x, y, fx(myUnits[i].x), fy(myUnits[i].y)) < myUnits[i].size * cs) {
					unit = myUnits[i];
					break;
				}
			}
			return unit;
		}

		var itemClick = function(e) {
			var parts = this.id.split(":")[1].split(";");
			placingType = Number(parts[0]);
			placingMaterial = Number(parts[1]);
			if (linearScale(unitTypes[placingType].cost, placingMaterial) <= $stash[placingMaterial]) {
				placing = true;
				if (mobile) {
					joystickDown = false;
					targetDown = false;
				}
			} else {
				pushMessage("Gather " + (linearScale(unitTypes[placingType].cost, placingMaterial) - $stash[placingMaterial]) + " more " + materialNames[placingMaterial] + " first", longMessage);
			}
			return false;
		}

		function itemMouseEnter(e) {
			var parts = this.id.split(":")[1].split(";");
			var type = Number(parts[0]);
			var material = Number(parts[1]);
			tipOn = true;
			var html = unitTypes[type].name + "<br><span class=\"minor\">" + unitTypes[type].description + "<br>";
			var amount = linearScale(unitTypes[type].cost, material) - $stash[material];
			if (amount > 0) {
				html += "Gather</span> " + amount + " " + materialNames[material];
			} else {
				html += "You have enough</span> " + materialNames[material];
			}
			tipElement.innerHTML = html;
			tipElement.style.display = "block";
			var temp = tipElement.clientHeight; // Force fade
			tipElement.style.opacity = "1";
		}

		function itemMouseLeave() {
			tipElement.style.opacity = "0";
			setTimeout(function() {
				if (tipElement.style.opacity == "0") {
					tipElement.style.display = "none";
					tipOn = false;
				}
			}, 200);
		}

		function populateStore() {
			scannerElement.width = storeIconSize + scannerPadding;
			scannerElement.height = storeIconSize + scannerPadding;
			scanner.lineWidth = lineWidth *(storeIconSize /(unitTypes[unitType.basicUnit].size * ptmr * 2));
			scanner.lineCap = "round";
			scanner.lineJoin = "round";
			storeBar.innerHTML = "";
			var ocs = cs;
			cs = 1;
			for (var i = 0; i < materialNum - 1; i++) {
				for (var j = 0; j < unitTypesSorted.length; j++) {
					if (unitTypesSorted[j] != unitType.core && unitTypesSorted[j] != unitType.boosterUnit) {
						var id = "u:" + unitTypesSorted[j] + ";" + i;
						scanner.clearRect(0, 0, scannerElement.width, scannerElement.height);
						unitTypes[unitTypesSorted[j]].bottom(scanner, scannerElement.width / 2, scannerElement.height / 2, storeIconSize / 2, Math.PI * 0.75, 0, i);
						unitTypes[unitTypesSorted[j]].top(scanner, scannerElement.width / 2, scannerElement.height / 2, storeIconSize / 2, Math.PI * 0.75, 0, i);
						var url = scannerElement.toDataURL("image/png", 1);
						storeBar.innerHTML += "<div id=\"" + id + "\" class=\"item\"><div class=\"item-inner\"><img src=\"" + url + "\" class=\"store-image\" draggable=\"false\" width=\"" +(originalStoreIconSize + scannerPadding) + "px\"><br>" + unitTypes[unitTypesSorted[j]].name + "<br><img style=\"height:18px;position:relative;top:2px;\" src=\"" + materialIcons[i] + "\"> " + linearScale(unitTypes[unitTypesSorted[j]].cost, i) + " <span class=\"minor\">" + materialNames[i] + "</span></div></div>";
					}
				}
			}
			cs = ocs;
			var items = document.getElementsByClassName("item");
			for (var i = 0; i < items.length; i++) {
				items[i].onclick = itemClick;
				if (!mobile) {
					items[i].onmouseenter = itemMouseEnter;
				}
				items[i].children[0].children[0].draggable = false;
				items[i].ondragstart = itemClick;
			}
		}

		function updateStore() {
			for (var i = 0; i < materialNum; i++) {
				for (var j = 1; j < unitTypes.length; j++) {
					var e = g("u:" + j + ";" + i).getElementsByClassName("item-inner")[0].getElementsByClassName("store-image")[0];
					if (linearScale(unitTypes[j].cost, i) <= $stash[i]) {
						// e.style["filter"] = "brightness(100%) grayscale(0)";
						e.style.opacity = 1;
						if (storage.tutorialStage == tutorial.firstUnit) {
							pushMessage("Nice! You can now build your first unit", longMessage);
							setTimeout(function() {
								if (mobile) {
									pushMessage("Tap on the icon in the store, and use your target to place it", longMessage);
								} else {
									pushMessage("Click on the icon in the store, and click again where you want to place it", longMessage);
								}
							}, tutorialDelay);
							storage.tutorialStage++;
							saveStorage();
						}
					} else {
						// e.style["filter"] = "brightness(20%)";
						e.style.opacity = 0.4;
					}
				}
			}
		}

		function initStashBox() {
			initMaterialIcons();
			var htmlMain = "";
			var htmlSpecial = "";
			for (var i = 0; i < materialNum; i++) {
				var h = "<div id=\"so" + i + "\" class=\"stash-item\"><img src=\"" + materialIcons[i] + "\" width=\"" + originalStashIconSize + "px\" style=\"position:relative;top:1.5px;\"> <span id=\"si" + i + "\">0</span>";
				if (!mobile) {
					h += " <span class=\"minor\">" + materialNames[i] + "</span>";
				}
				h += "</div>";
				if (i == materialNum - 1) {
					htmlSpecial += h;
				} else {
					htmlMain += h;
				}
			}
			stashMainBox.innerHTML = htmlMain;
			stashSpecialBox.innerHTML = htmlSpecial;
			scoreBox.innerHTML = "<div id=\"score-outer\" class=\"stash-item\"><span class=\"minor\">Score</span> <span id=\"score-inner\">0</span></div>";
		}

		function initMaterialIcons() {
			var actualSize = stashIconSize + stashIconLineWidth;
			scannerElement.width = actualSize;
			scannerElement.height = actualSize;
			scanner.lineWidth = stashIconLineWidth;
			scanner.lineCap = "round";
			scanner.lineJoin = "round";
			for (var i = 0; i < materialNum; i++) {
				scanner.clearRect(0, 0, actualSize, actualSize);
				scanner.fillStyle = materials[i];
				scanner.strokeStyle = shadeColor(materials[i], lineShade);
				scanner.beginPath();
				scanner.moveTo((stashIconSize / 2) + stashIconLineWidth / 2, stashIconLineWidth);
				scanner.lineTo(stashIconSize, stashIconSize);
				scanner.lineTo(stashIconLineWidth, stashIconSize);
				scanner.lineTo((stashIconSize / 2) + stashIconLineWidth / 2, stashIconLineWidth);
				scanner.closePath();
				scanner.fill();
				scanner.stroke();
				var url = scannerElement.toDataURL("image/png", 1);
				materialIcons[i] = url;
			}
		}

		function updateStashBox() {
			var somethingChanged = false;
			for (var i = 0; i < materialNum; i++) {
				var outerElement = g("so" + i);
				if (formatScore(stash[i]) != formatScore(oldStash[i])) {
					g("si" + i).innerText = formatScore(stash[i]);
				}
				if (formatScore($stash[i]) != formatScore($oldStash[i])) {
					outerElement.style.animationName = "pulse";
					setTimeout(function(e) {
						e.style.animationName = "";
					}.bind(null, outerElement), 1000);
					somethingChanged = true;
				}
				$oldStash[i] = $stash[i];
				oldStash[i] = stash[i];

				if ($stash[i] == 0) {
					stashSpecialBox.style.opacity = 0;
				} else {
					stashSpecialBox.style.opacity = 1;
				}
			}

			if (somethingChanged) {
				updateOptionsBox();
			}

			var outerElement = g("score-outer");
			if (formatScore(score) != formatScore(oldScore)) {
				g("score-inner").innerText = formatScore(score);
			}
			if (formatScore($score) != formatScore($oldScore)) {
				outerElement.style.animationName = "pulse";
				setTimeout(function(e) {
					e.style.animationName = "";
				}.bind(null, outerElement), 1000);
			}
			$oldScore = $score;
			oldScore = score;
		}

		function updateCamera(clientDelta) {
			var actualSpeed = cameraSpeed *(clientDelta / averageClientDelta);
			// cx = lerp(cx, selfCore.x, actualSpeed);
			// cy = lerp(cy, selfCore.y, actualSpeed);
			// cx = selfCore.x;
			// cy = selfCore.y;
			speedx = lerp(speedx, selfCore.$ox - selfCore.$x, actualSpeed);
			speedy = lerp(speedy, selfCore.$oy - selfCore.$y, actualSpeed);
			cx = selfCore.x + speedx * cameraLag;
			cy = selfCore.y + speedy * cameraLag;
			serverScale = lerp(serverScale, $serverScale, actualSpeed);
			rescale();
			// if (shaking) {
			// 	cx += (Math.random() * shakeAmount * 2 * cs) - shakeAmount * cs;
			// 	cy += (Math.random() * shakeAmount * 2 * cs) - shakeAmount * cs;
			// }
		}

		function updateScroll() {
			storeBarScroll = lerp(storeBarScroll, $storeBarScroll, 0.1);
			if (Math.abs(storeBar.scrollLeft - storeBarScroll) > 1) {
				storeBar.scrollLeft = storeBarScroll;
				scriptScrollTrigger = true;
			}
			if (storeBar.scrollLeft <= 1) {
				leftArrow.style.opacity = 0.3;
			} else {
				leftArrow.style.opacity = 1;
			}
			if (storeBar.scrollLeft >= storeBar.scrollWidth - storeBar.clientWidth - 1) {
				rightArrow.style.opacity = 0.3;
			} else {
				rightArrow.style.opacity = 1;
			}
		}

		function onScreen(o) {
			var x = fx(o.x);
			var y = fy(o.y);
			var s = o.size * cs;
			return(x > 0 - s - screenPadding && x < w + s + screenPadding && y > 0 - s - screenPadding && y < h + s + screenPadding);
		}

		function linearScale(amount, material) {
			return amount * (material + 1);
		}

		function expScale(amount, material) {
			return amount * Math.pow(2, material);
		}

		function updateRotation() {
			for (var i = 0; i < myUnits.length; i++) {
				if (myUnits[i].mouse) {
					myUnits[i].angle = afp(fx(myUnits[i].x), fy(myUnits[i].y), mx, my) - Math.PI / 2;
				}
			}
		}

		function updatePlacing() {
			var lx = mx;
			var ly = my;
			var angle = 0;
			var smallestDistance = -1;
			var closestUnit = 0;
			for (var i = 0; i < myUnits.length; i++) {
				if (myUnits[i].buildable) {
					var distance = dfp(mx, my, fx(myUnits[i].x), fy(myUnits[i].y));
					if (smallestDistance < 0 || distance < smallestDistance) {
						smallestDistance = distance;
						closestUnit = i;
					}
				}
			}

			placingOn = myUnits[closestUnit].id;
			angle = afp(mx, my, fx(myUnits[closestUnit].x), fy(myUnits[closestUnit].y)) + Math.PI;
			placingAngle = angle;
			var totalDistance = unitTypes[myUnits[closestUnit].type].size * cs * ptmr;
			if (unitTypes[placingType].shape == shape.circle) {
				totalDistance += unitTypes[placingType].size * cs * ptmr;
			} else if (unitTypes[placingType].shape == shape.triangle) {
				totalDistance += (unitTypes[placingType].size / 2) * cs * ptmr;
			}
			var point = pfa(fx(myUnits[closestUnit].x), fy(myUnits[closestUnit].y), angle, totalDistance);
			lx = point.x;
			ly = point.y;

			placingWithin = false;
			var actualMaterial = placingMaterial;
			for (var i = 0; i < myUnits.length; i++) {
				if (i != closestUnit && dfp(lx, ly, fx(myUnits[i].x), fy(myUnits[i].y)) <((unitTypes[placingType].size * ptmr) + myUnits[i].size) * cs) {
					placingWithin = true;
					actualMaterial = materialNum;
					break;
				}
			}

			game.globalAlpha = 0.8;
			unitTypes[placingType].bottom(game, lx, ly, unitTypes[placingType].size * cs * ptmr, angle - Math.PI / 2, angle - Math.PI / 2 + Math.PI, actualMaterial);
			unitTypes[placingType].top(game, lx, ly, unitTypes[placingType].size * cs * ptmr, angle - Math.PI / 2, angle - Math.PI / 2 + Math.PI, actualMaterial);
			game.globalAlpha = 1;
		}

		var optionsBoxTimer = null;

		function updateOptionsBox() {
			if (selectedUnit != null) {
				optionsHeading.innerHTML = unitTypes[selectedUnit.type].name + " <span class=\"minor\">(" + materialNames[selectedUnit.material] + ")</span>";
				if (selectedUnit.material < materialNum - 1) {
					var cost = upgradeCost(selectedUnit);
					upgradeButton.innerHTML = "<img style=\"height:22px;position:relative;top:4px;\" src=\"" + materialIcons[selectedUnit.material + 1] + "\"> Upgrade <span class=\"minor\">-" + cost + " " + materialNames[selectedUnit.material + 1] + "</span>";
					if (cost > $stash[selectedUnit.material + 1] ||(selectedUnit.material == materialNum - 2 && selectedUnit.type == unitType.alchemyLab)) {
						upgradeButton.disabled = true;
					} else {
						upgradeButton.disabled = false;
					}
				} else {
					upgradeButton.innerHTML = "Fully upgraded";
					upgradeButton.disabled = true;
				}
				if (selectedUnit.type != unitType.core) {
					destroyButton.style.display = "inline-block";
					upgradeButton.style.width = "calc(50% - 4px)";
					destroyButton.innerHTML = "<img style=\"height:22px;position:relative;top:4px;\" src=\"" + materialIcons[selectedUnit.material] + "\"> Destroy <span class=\"minor\">+" + selectedUnit.deleteAmount + " " + materialNames[selectedUnit.material] + "</span>";
				} else {
					destroyButton.style.display = "none";
					upgradeButton.style.width = "100%";
				}
				if (upgradeButton.disabled) {
					upgradeButton.style.bottom = "1px";
				} else {
					upgradeButton.style.bottom = "0px";
				}
				clearTimeout(optionsBoxTimer);
				optionsBoxTimer = null;
				optionsBox.style.display = "block";
				var temp = optionsBox.clientHeight; // Force fade
				optionsBox.style.opacity = "1";

				g("")
			} else {
				hideOptionsBox();
			}
		}

		function hideOptionsBox() {
			selectedUnit = null;
			optionsBox.style.opacity = "0";
			optionsBoxTimer = setTimeout(function() {
				optionsBox.style.display = "none";
			}, 500);
		}

		upgradeButton.onclick = function() {
			if (upgradeCost(selectedUnit) <= $stash[selectedUnit.material + 1]) {
				var buffer = new ArrayBuffer(byte + short); // code, id
				var view = new DataView(buffer, 0);
				view.setUint8(0, clientCode.upgrade, true);
				view.setUint16(byte, selectedUnit.id, true);
				io.send(buffer);
			} else {
				if (selectedUnit.material < materialNum - 1) {
					pushMessage("Gather " +(upgradeCost(selectedUnit) - $stash[selectedUnit.material + 1]) + " more " + materialNames[selectedUnit.material + 1] + " first", longMessage);
				} else {
					pushMessage("This unit has been upgraded to the limit", longMessage);
				}
			}
			hideOptionsBox();
		}

		destroyButton.onclick = function() {
			if (selectedUnit.type != unitType.core) {
				var buffer = new ArrayBuffer(byte + short); // code, id
				var view = new DataView(buffer, 0);
				view.setUint8(0, clientCode.delete, true);
				view.setUint16(byte, selectedUnit.id, true);
				io.send(buffer);
			}
			hideOptionsBox();
		}

		optionsClose.onclick = function() {
			hideOptionsBox();
		}

		function drawHalo() {
			game.save();
			game.translate(fx(selfCore.x), fy(selfCore.y));
			game.rotate(selfCoreHaloRotation);
			game.beginPath();
			game.setLineDash([10 * cs, 10 * cs]);
			game.strokeStyle = "#000000";
			game.globalAlpha = 0.2;
			game.lineWidth = 3 * cs;
			game.arc(0, 0,(selfCore.size + 25) * cs, 0, 2*Math.PI);
			game.stroke();
			game.closePath();
			game.restore();
			game.lineWidth = lineWidth * cs;
			game.setLineDash([]);
			game.globalAlpha = 1;
			selfCoreHaloRotation += 0.01;
		}

		function updateMinimap() {
			minimap.clearRect(0, 0, mms, mms);
			minimap.fillStyle = "#FFFFFF";
			minimap.beginPath();
			minimap.arc((selfCore.x / ww) *(mms - minimapDotSize * 2) +(mms / 2) + minimapDotSize / 4,(selfCore.y / wh) *(mms - minimapDotSize * 2) +(mms / 2) + minimapDotSize / 4, minimapDotSize, 0, 2*Math.PI);
			minimap.closePath();
			minimap.fill();
		}

		function fx(x) {
			return(x - cx) * cs + w / 2;
		}

		function fy(y) {
			return(y - cy) * cs + h / 2;
		}

		function drawHealthBar(x, y, p, a) {
			if (a < 1) {
				game.globalAlpha = a;
			}

			game.lineWidth = (lineWidth + healthBarBorderWidth) * cs;
			game.beginPath();
			game.strokeStyle = healthBarBackgroundColor;
			game.moveTo(x - healthBarWidth * cs / 2, y);
			game.lineTo(x + healthBarWidth * cs / 2, y);
			game.stroke();
			game.closePath();

			game.beginPath();
			game.lineWidth = lineWidth * cs;
			game.strokeStyle = healthBarForegroundColor;
			game.moveTo(x - healthBarWidth * cs / 2, y);
			p *= 2;
			p -= 1;
			p *= healthBarWidth * cs / 2;
			game.lineTo(x + p, y);
			game.stroke();
			game.closePath();

			if (a < 1) {
				game.globalAlpha = 1;
			}
		}

		function upgradeCost(u) {
			return Math.floor(linearScale(unitTypes[u.type].cost, u.material + 1) - linearScale(unitTypes[u.type].cost, u.material) / 4);
		}

		function updateUnitCounter() {
			unitCounter.innerHTML = (myUnits.length - 1) + "<span class=\"minor\">/" + unitLimit + " units</span>";
		}

		var mid = 0;
		function pushMessage(m, t) {
			alertsElement.innerHTML += "<div class=\"alert\" id=\"m" + mid + "\" style=\"opacity:0;margin-bottom:-24px;width:100%;\"></div>";
			var id = "m" + mid;
			var newAlert = document.getElementById(id);
			var temp = newAlert.clientHeight; // Force fade
			newAlert.innerText = m;
			newAlert.style.opacity = 1;
			newAlert.style.marginBottom = "0px";
			mid++;
			setTimeout(function() {
				var e = document.getElementById(id);
				e.style.opacity = 0;
				setTimeout(function() {
					document.getElementById(id).remove();
				}.bind(null, id), 500);
			}.bind(null, id), t);
		}

		function qs() {
			var string = {};
			var query = window.location.search.substring(1);
			var vars = query.split("&");
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				if (typeof string[pair[0]] === "undefined") {
					string[pair[0]] = decodeURIComponent(pair[1]);
				} else if (typeof string[pair[0]] === "string") {
					var arr = [string[pair[0]],decodeURIComponent(pair[1])];
					string[pair[0]] = arr;
				} else {
					string[pair[0]].push(decodeURIComponent(pair[1]));
				}
			}
			return string;
		};

		function formatScore(n) {
			n = Math.round(n);
			if (n >= 1000) {
				n /= 1000;
				n = n.toFixed(1);
				n = n + "k";
			}
			return n;
		}

		function formatDataNumber(n) {
			if (n >= 1000 && n < 1000000) {
				n /= 1000;
				n = Math.round(n);
				n = n + "KB";
			} else if (n >= 1000000 && n < 1000000000) {
				n /= 1000000;
				n = Math.round(n);
				n = n + "MB";
			} else if (n >= 1000000000) {
				n /= 1000000000;
				n = Math.round(n);
				n = n + "GB";
			}
			return n;
		}

		function formatTime(time) {
			time = Math.round(time / 1000);
			var h = Math.floor(time / 3600);
			var m = Math.floor((time -(h * 3600)) / 60);
			var s = time -(h * 3600) -(m * 60);
			var parts = [];
			var noun;
			if (h > 0) {
				noun = " hour";
				if (h != 1) {
					noun += "s";
				}
				parts.push(h + noun);
			}
			if (m > 0) {
				noun = " minute";
				if (m != 1) {
					noun += "s";
				}
				parts.push(m + noun);
			}
			noun = " second";
			if (s != 1) {
				noun += "s";
			}
			parts.push(s + noun);
			if (parts.length == 1) {
				return parts[0];
			} else if (parts.length == 2) {
				return parts[0] + " and " + parts[1];
			} else if (parts.length == 3) {
				return parts[0] + ", " + parts[1] + " and " + parts[2];
			}
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

		function ferp(o, c, t, n) {
			var distance = 0;
			if (Math.abs(t - o) >= Math.abs(t - c)) {
				distance = t - o;
			} else {
				distance = t - c;
			}
			var interval = distance * n;
			if (c == t ||(c < t && c + interval > t) ||(c > t && c + interval < t)) {
				return t;
			} else {
				return c + interval;
			}
			return c + interval;
		}

		function lerp(a, b, f) {
			return(a *(1 - f)) +(b * f);
		};

		//Function: return random number in range
		function random(r) {
			return Math.floor(Math.random() * r);
		};

		function htmlEncode(s) {
			el = document.createElement("div");
			el.innerText = el.textContent = s;
			s = el.innerHTML;
			return s;
		}

		function shadeColor(color, percent) {
		    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
		    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
		}

		function blurFilter(a) {
			return "blur(" +(dissolveBlur -(a * dissolveBlur)) + "px)"
		}

		function background() {
			game.fillStyle = "#f2f2f2";
			game.fillRect(0,0,w,h);

			// Comment for taking pics
			game.strokeStyle = "#dddddd";
			game.lineWidth = gridLineWidth * cs;
			var ox = fx(Math.ceil((cx - w / 2 / cs) / gridSize) * gridSize);
			for (var i = -1; i < w /(gridSize * cs) + 2; i++) {
				game.beginPath();
				game.moveTo(ox + i * gridSize * cs, 0);
				game.lineTo(ox + i * gridSize * cs, h);
				game.stroke();
				game.closePath();
			}

			var oy = fy(Math.ceil((cy - h / 2 / cs) / gridSize) * gridSize);
			for (var i = -1; i < h /(gridSize * cs) + 2; i++) {
				game.beginPath();
				game.moveTo(0, oy + i * gridSize * cs);
				game.lineTo(w, oy + i * gridSize * cs);
				game.stroke();
				game.closePath();
			}

			game.lineWidth = lineWidth * cs;

			game.fillStyle = "#000000";
			game.globalAlpha = 0.2;
			game.fillRect(fx(-ww / 2) - w, 0, w, h);
			game.fillRect(fx(ww / 2), 0, w, h);
			game.fillRect(fx(-ww / 2), fy(-wh / 2) - h, ww * cs, h);
			game.fillRect(fx(-ww / 2), fy(wh / 2), ww * cs, h);
			game.globalAlpha = 1;
		}

		function sortUnitTypes() {
			unitTypesSorted = [];
			for (var i = 0; i < unitTypes.length; i++) {
				unitTypesSorted[i] = i;
			}
			unitTypesSorted.sort(function(a, b) {
				return unitTypes[a].cost - unitTypes[b].cost;
			});
		}

		function g(id) {
			return document.getElementById(id);
		}

		function css(el) {
		    var sheets = document.styleSheets, ret = [];
		    el.matches = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector
		        || el.msMatchesSelector || el.oMatchesSelector;
		    for (var i in sheets) {
				try {
			        var rules = sheets[i].rules || sheets[i].cssRules;
			        for (var r in rules) {
			            if (el.matches(rules[r].selectorText)) {
			                ret.push(rules[r].cssText);
			            }
			        }
				} catch(e) {};
		    }
		    return ret;
		}

		function filter(t) {
			return profanityFilter.clean(t);
		}

		function loadStorage() {
			if (localStorage.data) {
				storage = JSON.parse(localStorage.data);
			} else {
				saveStorage();
			}
		}

		function saveStorage() {
			localStorage.data = JSON.stringify(storage);
		}

		loadStorage();
		nameBox.value = storage.name;
		if (!mobile) {
			nameBox.focus();
		}

		var nameBoxChange = function() {
			var encoded = btoa(unescape(encodeURIComponent(nameBox.value))).substr(0, nameMax);
			try {
				nameBox.value = decodeURIComponent(escape(atob(encoded)));
			} catch(e) {
				console.log("Error: " + e);
				nameBox.value = nameBox.value.substr(0, nameMax);
			}
		}
		nameBox.oninput = nameBoxChange;
		nameBox.onpaste = nameBoxChange;
		nameBox.onkeydown = function(e) {
			if (e.key == "Enter") {
				play();
			}
		}

		if (socialCard) {
			function socialClick(name, state, instant) {
				var index = storage.socialButtons.indexOf(name);
				if (state) {
					if (index == -1) {
						storage.socialButtons.push(name);
					}
				} else {
					if (index != -1) {
						storage.socialButtons.splice(index, 1);
					}
				}

				storage.socialTotal = storage.socialButtons.length * socialBonus;
				saveStorage();
				if (instant != false) {
					updateSocialMessage();
				}
			}

			function updateSocialMessage() {
				if (storage.socialTotal > 0 && storage.socialTotal < socialNum * socialBonus) {
					shareMessage.innerHTML = "Increase your bonus by clicking other social media buttons";
				} else if (storage.socialTotal >= socialNum * socialBonus) {
					shareMessage.innerHTML = "Thanks for your support!";
				} else if (storage.socialTotal <= 0) {
					shareMessage.innerHTML = "Start with extra resources by supporting us on social media";
				}

				if (storage.socialTotal > 0) {
					shareProgressOuter.style.display = "block";
					shareProgressInner.style.width = ((storage.socialTotal / (socialNum * socialBonus)) * 100) + "%";
					shareProgressInner.innerText = "+" + storage.socialTotal;
				}

				shareMessage.onclick = null;
			}

			function socialRedeem(socialName) {
				setTimeout(function() {
					shareMessage.innerHTML = "<a href=\"#\">Click to redeem</a>";
					shareMessage.onclick = function() {
						shareMessage.onclick = null;
						socialClick(socialName, true, true);
					}.bind(null, socialName);
				}, 3000);
			}

			function doSocial() {
				if (typeof FB !== "undefined") {
					FB.Event.subscribe("edge.create", function() {
						socialClick("facebook-like", true, true);
					});
					FB.Event.subscribe("edge.remove", function() {
						socialClick("facebook-like", false, true);
					});
				}
				twttr.events.bind("tweet", function() {
					socialRedeem("twitter-tweet");
				});
				twttr.events.bind("follow", function() {
					socialRedeem("twitter-follow");
				});
			}

			if (typeof FB === "undefined" || typeof twttr === "undefined") {
				window.addEventListener("load", function() {
					doSocial();
				});
			} else {
				doSocial();
			}

			discordButton.onclick = function() {
				socialClick("discord-join", true, true);
			};

			var youtubeHovering = false;
			var youtubeSubscribeButton = g("___ytsubscribe_0");
			youtubeSubscribeButton.onmouseenter = function() {
				youtubeHovering = true;
			}
			youtubeSubscribeButton.onmouseleave = function() {
				youtubeHovering = false;
			}
			var facebookHovering = false;
			var facebookShareButton = document.getElementsByClassName("fb-share-button")[0];
			facebookShareButton.onmouseenter = function() {
				facebookHovering = true;
			}
			facebookShareButton.onmouseleave = function() {
				facebookHovering = false;
			}

			updateSocialMessage();
		}

		window.onbeforeunload = function() {
			if (io != null) {
				io.onclose = function () {};
				io.close();
			}
			if (socialCard && youtubeHovering) {
				socialClick("youtube-subscribe", true, false);
			}
			if (hasPlayed && parse_query_string(window.location.search.substring(1)).source != "app") {
				return "Are you sure that you want to exit? You will lose your current progress in the game";
			}
		}

		window.onblur = function() {
			if (socialCard && facebookHovering) {
				socialRedeem("facebook-share");
			}
			for (var i = 0; i < keysCodes.length; i++) {
				key(keysCodes[i], 0);
			}
		}

		document.onmouseout = function() {
			key(1, 0);
		}

		setupNetwork(ip);
	} catch(e) {
		setTimeout(function() {
	        onDisconnect();
	    }, 1000);
		throw e;
	}
}

ready();
