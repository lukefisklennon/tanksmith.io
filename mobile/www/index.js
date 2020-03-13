var address = "http://tanksmith.io/?source=app";

var isReady = false;
var isOnline = false;
var notAlerted = true;

function ready() {
	isReady = true;
	if (isOnline) {
		start();
	}
}

function online() {
	isOnline = true;
	if (navigator.connection.type !== Connection.NONE) {
		if (isReady) {
			start();
		}
	}
}

function offline() {
	if (notAlerted) {
		alert("An Internet connection is required");
		notAlerted = false;
	}
	navigator.app.exitApp();
}

function start() {
	window.location = address;
}

document.addEventListener("deviceready", ready, false);
document.addEventListener("offline", offline, false);
document.addEventListener("online", online, false);
