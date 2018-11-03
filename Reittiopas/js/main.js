var noOfResults = 10;
var noOfCols = 6;
var tbl_body = document.createElement("tbody");
var now = new Date();
var debuggy; 
var omaquery = '{\n stops(name: "3072") {\n  stoptimesWithoutPatterns(numberOfDepartures: 10) {\n   scheduledArrival\n   realtimeArrival\n   realtime\n   realtimeState\n   trip {\n    id\n    serviceId\n    tripShortName\n    tripHeadsign\n    gtfsId\n    route {\n     id\n     shortName\n    }\n   }\n   headsign\n  }\n }\n}';
/*    
    
    `{
	stops(name: "3072") {
		stoptimesWithoutPatterns(numberOfDepartures: ${noOfResults}) {
			scheduledArrival
			realtimeArrival
			realtime
			realtimeState
			trip {
				id
				serviceId
				tripShortName
                tripHeadsign
				gtfsId
				route {
					id
					shortName
				}
			}
			headsign
		}
	}
}`;*/

function hslToJDate(hslDate) {
    var convertedTime = new Date();
    convertedTime.setHours(0, 0, hslDate, 0);
    return convertedTime;
}

function timeDiff(msecs) {

    var milliseconds = parseInt((msecs % 1000) / 100);
    var seconds = Math.abs(parseInt((msecs / 1000) % 60));
    var minutes = Math.abs(parseInt((msecs / (1000 * 60)) % 60));
    var hours = Math.abs(parseInt((msecs / (1000 * 60 * 60)) % 24));

    this.negative = (msecs < 0) ? "-" : "+";
 
    this.hoursOut = (hours > 0) ? hours + ":" : "";
    this.minutesOut = getMinutesOut(minutes, hours);
    this.secondsOut = getSecondsOut(hours, minutes, seconds);
    this.all = this.negative + this.hoursOut + this.minutesOut + this.secondsOut;
    this.delay = (msecs != 0) ? this.all : "";
    this.eta = this.hoursOut + this.minutesOut + this.secondsOut;
    
    function getMinutesOut(minutes, hours) {
        var minutesOut;
        if (minutes == 0 && hours <= 0) {
            minutesout = "0"
        }
        if (minutes == 0 && hours > 0) {
            minutesout = "00"
        }
        if (minutes < 10 && hours > 0) {
            minutesOut = "0" + minutes;
        }
        else {
            minutesOut = minutes;
        }
        return minutesOut;
    }

    function getSecondsOut(hours, minutes, seconds) {
        var secondsOut;
        if (minutes < 10 && hours == 0) {
            if (seconds < 10) {
                secondsOut = ":0" + seconds;
            }
            if (seconds >= 10) {
                secondsOut = ":" + seconds;
            }
        }
        else {
            secondsOut = "";
        }
        return secondsOut;
    }


//    return this.negative + this.hoursOut + this.minutesOut + this.secondsOut;
}



$(document).ready(function () {

    var table = $('#aikataulu').DataTable({
        "paging": false,
        "processing": false,
        "searching": false,
        "info": false,
        "autoWidth": false,
        "order": [[2, "asc"]],
        "ajax": {
            url: 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql',
            type: 'post',
            cache: false,
            data: function () {
                return omaquery;
            },
            headers: {
                "Content-Type": 'application/graphql'
            },
            datatype: 'json',
            dataSrc: function (json) { return jsonPath(json, "$.data.stops[0].stoptimesWithoutPatterns")[0] }
        },
        'columns': [
            {
                title: "Numero",
                data: "trip.route.shortName",
                render: function (data, type, row) { return ("<span class=\"reitinnumero\">" + data + "</span>") }
            },
            {
                title: "Määränpää",
                data: null, //"trip.tripHeadsign",
                render: function (data, type, row) { return ("<span class=\"reitinnimi\">" + row.trip.tripHeadsign + "</span><span class=\"kautta\"> - " + (row.headsign).replace(/.*?(?=via)/, "") + "</span>")}
            },
            {
                title: "Aikataulu",
                data: "realtimeArrival",
                visible: false
            },
            {
                title: "Saapuu",
                data: "realtimeArrival",
                render: function (data, type, row) {
                 //   var timeSpan = new timeDiff(hslToJDate(row.realtimeArrival) - hslToJDate(row.scheduledArrival));
                    return ("<div class=\"saapumisaika\">" + dateFns.format(hslToJDate(row.realtimeArrival), "HH:mm") + "</div>");
                }
            },
            {
                title: "",
                data: null,
                render: function (data, type, row) {
                    var timeSpan = new timeDiff(hslToJDate(row.realtimeArrival) - hslToJDate(row.scheduledArrival));
                    return ("<div class=\"erotus\">" + timeSpan.delay + "</div>");
                }
            },
            {
                title: "Aikaa",
                data: null,
                render: function (data, type, row) {
                    var timeSpan = new timeDiff(hslToJDate(row.realtimeArrival) - new Date());
                    return ("<span class=\"aikaa min\">" + timeSpan.eta + "</span>");
                }
            }
        ]
    });

   setInterval(function () { table.ajax.reload(null, false); }, 1000);

});