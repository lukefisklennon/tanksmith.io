// var sl = require(__dirname + "/serverlist.js");
var request = require("request");

setInterval(function() {
	// sl.update(false, 2000, function(list, s) {
    //     process.stdout.write(String(s.max) + "  ");
    // });
	request("http://45.33.42.188:8001/find", function(error, response, body) {
		if (error) {
			console.log(error.code);
		} else {
			console.log(body);
		}
	});
}, 2500);
