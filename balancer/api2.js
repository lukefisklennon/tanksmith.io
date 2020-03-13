var fs = require("fs");
var key = "";
var client = new(require("linode-api").LinodeClient)(key);
var plan = 1;
var stackscript = 180218;
var distribution = 146;
var password = "";
var kernelName = "Latest 64 bit";

var locations = [{LOCATION:"Dallas, TX, USA",DATACENTERID:2,ABBR:"dallas"},{LOCATION:"Fremont, CA, USA",DATACENTERID:3,ABBR:"fremont"},{LOCATION:"Atlanta, GA, USA",DATACENTERID:4,ABBR:"atlanta"},{LOCATION:"Newark, NJ, USA",DATACENTERID:6,ABBR:"newark"},{LOCATION:"London, England, UK",DATACENTERID:7,ABBR:"london"},{LOCATION:"Tokyo, JP",DATACENTERID:8,ABBR:"tokyo"},{LOCATION:"Singapore, SG",DATACENTERID:9,ABBR:"singapore"},{LOCATION:"Frankfurt, DE",DATACENTERID:10,ABBR:"frankfurt"},{LOCATION:"Tokyo 2, JP",DATACENTERID:11,ABBR:"shinagawa1"}];

var plans = [{CORES:1,XFER:1e3,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:5,PLANID:1,LABEL:"Linode 1024",DISK:20,RAM:1024,HOURLY:0.0075},{CORES:1,XFER:2e3,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:10,PLANID:2,LABEL:"Linode 2048",DISK:30,RAM:2048,HOURLY:0.015},{CORES:2,XFER:3e3,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:20,PLANID:3,LABEL:"Linode 4096",DISK:48,RAM:4096,HOURLY:0.03},{CORES:4,XFER:4e3,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:40,PLANID:4,LABEL:"Linode 8192",DISK:96,RAM:8192,HOURLY:0.06},{CORES:6,XFER:8e3,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:80,PLANID:5,LABEL:"Linode 12288",DISK:192,RAM:12288,HOURLY:0.12},{CORES:8,XFER:16000,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:160,PLANID:6,LABEL:"Linode 24576",DISK:384,RAM:24576,HOURLY:0.24},{CORES:12,XFER:2e4,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:320,PLANID:7,LABEL:"Linode 49152",DISK:768,RAM:49152,HOURLY:0.48},{CORES:16,XFER:2e4,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:480,PLANID:8,LABEL:"Linode 65536",DISK:1152,RAM:65536,HOURLY:0.72},{CORES:20,XFER:2e4,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:640,PLANID:9,LABEL:"Linode 81920",DISK:1536,RAM:81920,HOURLY:0.96},{CORES:1,XFER:5e3,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:60,PLANID:10,LABEL:"Linode 16384",DISK:20,RAM:16384,HOURLY:0.09},{CORES:2,XFER:6e3,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:120,PLANID:11,LABEL:"Linode 32768",DISK:40,RAM:32768,HOURLY:0.18},{CORES:4,XFER:7e3,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:240,PLANID:12,LABEL:"Linode 61440",DISK:90,RAM:61440,HOURLY:0.36},{CORES:8,XFER:8e3,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:480,PLANID:13,LABEL:"Linode 102400",DISK:200,RAM:102400,HOURLY:0.72},{CORES:16,XFER:9e3,AVAIL:{2:500,3:500,4:500,6:500,7:500,8:500,9:500,10:500,11:500},PRICE:960,PLANID:14,LABEL:"Linode 204800",DISK:340,RAM:204800,HOURLY:1.44}];

module.exports = {
    create: function(locationName, callback) {
        var location = locations.find(function(o) {
            return o.ABBR == locationName;
        }).DATACENTERID;
        client.call("linode.create", {DatacenterID: location, PlanID: plan}, function(e, r) {
            if (e == undefined) {
                var id = r.LinodeID;
                console.log("Creating Linode " + id);
				var options = {};
                client.call("linode.disk.createfromstackscript", {LinodeID: id, StackScriptID: stackscript, StackScriptUDFResponses: JSON.stringify(options), DistributionID: distribution, Label: "io1-disk-root", Size: plans[plan - 1].DISK * 1000, rootPass: password}, function(e, r) {
                    if (e == undefined) {
                        var diskRoot = r.DiskID;
                        console.log("Creating root disk " + diskRoot);
                        client.call("linode.disk.create", {LinodeID: id, Label: "io1-disk-swap", Type: "swap", Size: 256}, function(e, r) {
                            if (e == undefined) {
                                var diskSwap = r.DiskID;
                                console.log("Creating swap disk " + diskSwap);
                                client.call("avail.kernels", {}, function(e, r) {
                                    var kernel = r.find(function(o) {
                                        return o.LABEL.indexOf(kernelName) != -1;
                                    }).KERNELID;
                                    client.call("linode.config.create", {LinodeID: id, KernelID: kernel, label: "io1", DiskList: diskRoot + "," + diskSwap}, function(e, r) {
                                        if (e == undefined) {
                                            var config = r.ConfigID;
                                            console.log("Creating config " + config);
                                            client.call("linode.boot", {LinodeID: id, ConfigID: config}, function(e, r) {
                                                if (e == undefined) {
                                                    console.log("Booting the Linode up");
                                                    client.call("linode.ip.list", {LinodeID: id}, function(e, r) {
                                                        var ip = r[0].IPADDRESS;
                                                        if (e == undefined) {
                                                            callback(null, id, ip);
                                                        } else {
                                                            callback(e + " when getting the IP address", null);
                                                        }
                                                    });
                                                } else {
                                                    callback(e + " when booting the Linode", null);
                                                }
                                            });
                                        } else {
                                            callback(e + " when creating the config", null);
                                        }
                                    });
                                });
                            } else {
                                callback(e + " when creating the swap disk", null);
                            }
                        });
                    } else {
                        callback(e + " when creating the root disk", null);
                    }
                });
            } else {
                callback(e + " when creating the Linode", null);
            }
        });
    },
    destroy: function(ip, c) {
        client.call("linode.ip.list", {}, function(e, r) {
            if (e == undefined) {
                var ipObject = r.find(function(o) {
                    return o.IPADDRESS == ip;
                });
                if (typeof(ipObject) != "undefined") {
					console.log("Found Linode " + ipObject.LINODEID + " with IP address " + ip);
                    client.call("linode.delete", {LinodeID: ipObject.LINODEID, skipChecks: true}, function(e, r) {
                        c(null);
                    });
                } else {
                    c("Error: cannot find Linode with the IP address " + ip);
                }
            } else {
                c(e + " when listing IP addresses");
            }
        });
    }
}
