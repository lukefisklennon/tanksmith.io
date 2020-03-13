if (typeof Raven !== "undefined") Raven.config("https://c7bc6748d103454f83bb852e9d37d680@sentry.io/240855").install();

var actuallyHasPlayed = false;
var killedTab = false;
// setTimeout(function() {
// 	if (!actuallyHasPlayed) {
// 		killedTab = true;
// 		forceDisconnect();
// 	}
// }, 120000);

var port = "9002";

try {
	// document.documentElement.style.zoom = "0.5";
	var minified = (window.location.hostname != "localhost");
    var loaded = false;
    var serverFound = false;
    var ip = null;
    var io = null;
    var party = "";
    var wantParty = false;
	var playCount = 0;
	var mobile = isMobile();
	var app = mobile && parse_query_string(window.location.search.substring(1)).source == "app";
	var scriptActive = false;
	var firstLoad = true;
	var eu = true;

	if (app) {
		var cordovaWait = setInterval(function() {
			if ("cordova" in window) {
				clearInterval(cordovaWait);
				document.addEventListener("deviceready", function() {
					if ("cordova" in window && admob) {
						createBanner();
					}
				}, false);
			}
		}, 100);
	}

	function createBanner() {
		if ("cordova" in window && admob) {
			admob.banner.config({
				id: "ca-app-pub-5728247954177044/9130239669",
				size: admob.AD_SIZE.BANNER,
				overlap: true,
				autoShow: true,
				isTesting: false
			});
			admob.banner.prepare();
		}
	}

	function removeBanner() {
		if ("cordova" in window && admob) {
			admob.banner.remove();
		}
	}

	function prepareInterstitial() {
		if ("cordova" in window && admob) {
			admob.interstitial.config({
				id: "ca-app-pub-5728247954177044/2963167001",
				autoShow: false,
				isTesting: false
			});
			admob.interstitial.prepare()
		}
	}

	function showInterstitial() {
		if ("cordova" in window && admob) {
			admob.interstitial.show()
		}
	}

	var gameScale = 1;
	function calculateScale() {
		var actualHeight = window.innerHeight;
		if (mobile) {
			var actualHeight = screen.height;
			if (screen.width < screen.height) {
				actualHeight = screen.width;
			}
		}
		gameScale = (actualHeight / 1080) * 1.15;
		if (mobile) {
			gameScale = (actualHeight / 360) * 0.6;
		}
	}
	calculateScale();

	if (mobile) {
		g("social").remove();
		if (pqs(window.location.search.substring(1)).source == "app") {
			var adContainers = document.getElementsByClassName("ad");
			var numAds = adContainers.length;
			for (var i = 0; i < numAds; i++) {
				adContainers[0].remove();
			}
		}
		g("minimap").style.display = "none";
	}
	g("loading").style.transform = "translate(-50%, -50%) scale(" + gameScale + ")";

    function ready() {
		if (localStorage.mode == "ffa"/* && (port == "9003" || port == "443")*/) port = "9002";
		if (localStorage.mode == "br"/* && (port == "9002" || port == "80")*/) port = "9003";
        go("ws://" + ip + ":" + port + "/", localStorage.mode);
    }

    function findServer() {
		if (!killedTab) {
	    	console.log("Finding a server...");

			// TODO: fallback
			// var servers = ["45.33.57.189", "172.104.246.238"];
			// if (servers.length > 0) {
			// 	ip = servers[Math.floor(Math.random() * servers.length)];
			// 	console.log(ip);
			// 	connectToIP();
			// }

	    	var x = new XMLHttpRequest();
	    	x.onreadystatechange = function() {
	    		if (this.readyState == 4 && this.status == 200) {
	    			var data = JSON.parse(x.responseText);
	    			if (!data.error) {
	    				serverFound = true;
	                    ip = data.ip;
	                    g("count").innerHTML = data.players.toLocaleString("en-US") + " players online";
	                    party = data.link;
						g("version").innerText = "v" + data.version;
						console.log("Region: " + data.region);
						eu = data.eu;
	                    loadScript(data.version);
	    			} else {
	    				console.log("Error fetching server from load balancer");
						if (typeof Raven !== "undefined") Raven.captureException("Error fetching server from load balancer: " + JSON.stringify(data));
						if (localStorage.mode != "ffa") {
							localStorage.mode = "ffa";
							highlightMode();
						}
	    			}
	    		};
	    	};

	    	x.open("GET", "http://" + loadBalancer + ":8001/find/?mode=" + localStorage.mode, true);
	    	x.send();
	    	setTimeout(serverTimeout, 5000);
		}
    };

    function connectToIP() {
        console.log("Trying to connect to " + ip + "...");

		// TODO: fallback
		serverFound = true;
		loadScript("2.13");

        // var x = new XMLHttpRequest();
    	// x.onreadystatechange = function() {
        //     if (this.readyState == 4) {
        // 		if (this.status == 200) {
        // 			var data = x.responseText.split("\n");
		// 			if (Date.now() - Number(data[5]) < 5000) {
	    //                 if (Number(data[0]) < Number(data[1])) {
		// 					serverFound = true;
	    //                     loadScript(data[2]);
	    //                 } else {
	    //                     console.log(ip + " is full");
	    //                     findServer();
	    //                 }
		// 			} else {
		// 				console.log(ip + " is down");
		// 				findServer();
		// 			}
        // 		} else {
        //             findServer();
        //         }
        //     }
    	// };
		//
    	// x.open("GET", "http://" + ip + ":7000/status.txt", true);
    	// x.send();
    }

    function serverTimeout() {
    	if (!serverFound) {
    		findServer();
    	}
    };

    function onDisconnect() {
		// if (port == "80") {
		// 	port = "9002";
		// } else if (port == "9002") {
		// 	port = "80";
		// } else if (port == "443") {
		// 	port = "9003";
		// } else if (port == "9003") {
		// 	port = "443";
		// }
		scriptActive = false;
		if (io != null) {
			io.close();
		}
		setTimeout(function() {
			if (!scriptActive) {
		        if (wantParty) {
		            connectToIP();
		        } else {
		            if (serverFound) { // TODO
		                findServer();
		            }
		        }
		        wantParty = false;
		    	serverFound = false;
			}
		}, 1000);
    }

    function forceDisconnect() {
        io.close();
    }

    function loadScript(name) {
		if (firstLoad) {
			console.log("Loading banner ad");
			if (window.location.hostname != "localhost" && pqs(window.location.search.substring(1)).source != "app") {
				if (eu == false) {
					aiptag.consented = true;
					console.log("Ad consent: true");
				} else {
					aiptag.consented = false;
					console.log("Ad consent: false");
				}
				aiptag.cmd.display.push(function() { aipDisplayTag.display('tanksmith-io_300x250'); });
			}
			firstLoad = false;
		}

		if (io != null) {
			io.close();
		}

        if (typeof(mouseInterval) !== "undefined") {
            clearInterval(mouseInterval);
        }
		if (typeof(pingInterval) !== "undefined") {
            clearInterval(pingInterval);
        }
		if (typeof(debugInterval) !== "undefined") {
            clearInterval(debugInterval);
        }

		var extension = ".js";
		if (minified) {
			extension = ".min.js";
		}
        var script = document.createElement("script");
        script.src = name + extension;
        console.log("Loading script " + name + extension);
        document.body.appendChild(script);
    }

    function getPlayerCount() {
        var x = new XMLHttpRequest();
    	x.onreadystatechange = function() {
    		if (this.readyState == 4 && this.status == 200) {
    			var data = JSON.parse(x.responseText);
                g("count").innerHTML = data.players + " playing now";
				eu = data.eu;
    		};
    	};

    	x.open("GET", "http://" + loadBalancer + ":8001/players/", true);
    	x.send();
    }

    function hexStringToByte(str) {
        if (!str) {
            return new Uint8Array();
        }

        var a = [];
        for (var i = 0, len = str.length; i < len; i+=2) {
            a.push(parseInt(str.substr(i,2),16));
        }

        return new Uint8Array(a);
    }

    window.onload = function() {
        g("loading").innerHTML = "Connecting...";//<br><span style=\"font-size:20px\">Due to unexpected demand, you may not be able to connect right now. We're working on it!</span>";
		if ("cordova" in window) {
			navigator.splashscreen.hide();
		}
        setTimeout(function() {
			var socialElement = g("social");
			if (socialElement) {
            	socialElement.style.opacity = "1";
			}
        }, 500);
    };

    g("party-create").onclick = function() {
        window.location.hash = party;
        prompt("Copy and send this link", location.origin + location.pathname + location.hash);
    }

    g("party-join").onclick = function() {
        var data = prompt("Enter party link or code");
		if (data != null && data.length > 0) {
	        data = data.split("#");
	        if (data.length > 1) {
	            ip = data[1];
	        } else {
	            ip = data[0];
	        }
			if (/[0-9A-F]{6}$/i.test(ip)) {
				ip = decodePartyLink(ip);
		        wantParty = true;
		        forceDisconnect();
			}
		}
    }

	function highlightMode() {
		if (g("ffa") != null) {
			if (localStorage.mode == "ffa") {
				g("ffa").classList.add("mode-selected");
				g("br").classList.remove("mode-selected");
			} else if (localStorage.mode == "br") {
				g("ffa").classList.remove("mode-selected");
				g("br").classList.add("mode-selected");
			}
		}
	}

	if (parse_query_string(window.location.search.substring(1)).mode) localStorage.mode = parse_query_string(window.location.search.substring(1)).mode;
	if (localStorage.mode) {
		highlightMode();
	} else {
		localStorage.mode = "ffa";
	}

    var hash = window.location.hash.substring(1);
    if (hash.length > 0) {
		party = hash;
        ip = decodePartyLink(hash);
        connectToIP();
        getPlayerCount();
    } else {
        findServer();
    }

	if (g("ffa") != null) {
		g("ffa").onclick = function() {
			if (localStorage.mode != "ffa") {
				localStorage.mode = "ffa";
				highlightMode();
				forceDisconnect();
			}
		}

		function switchToBr() {
			if (localStorage.mode != "br") {
				localStorage.mode = "br";
				highlightMode();
				forceDisconnect();
			}
		}

		g("br").onclick = switchToBr;
		// g("br-ad").onclick = switchToBr;
	}

	// var youtubers = ["UCvVI98ezn4TpX5wDMZjMa3g"];
	// var youtuber = youtubers[Math.floor(Math.random() * youtubers.length)];
	// var html = "<div style=\"padding-bottom:8px;\">Featured YouTuber</div><div class=\"g-ytsubscribe\" data-channel";
	// if (youtuber.length == 24) {
	// 	html += "id";
	// }
	// html += "=\"" + youtuber + "\" data-layout=\"full\" data-count=\"default\"></div>";
	// g("youtuber").innerHTML = html;

    function g(id) {
        return document.getElementById(id);
    }

    function decodePartyLink(s) {
        return hexStringToByte(s).join(".");
    }

	function isMobile() {
		var check = false;
		(function(a){if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}

	function parse_query_string(query) {
	  var vars = query.split("&");
	  var query_string = {};
	  for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
		  query_string[pair[0]] = decodeURIComponent(pair[1]);
		  // If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
		  var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
		  query_string[pair[0]] = arr;
		  // If third or later entry with this name
		} else {
		  query_string[pair[0]].push(decodeURIComponent(pair[1]));
		}
	  }
	  return query_string;
  	}
} catch(e) {
    setTimeout(function() {
		if (typeof Raven !== "undefined") Raven.captureException(e);
        window.location.reload(true);
    }, 1000);
}
