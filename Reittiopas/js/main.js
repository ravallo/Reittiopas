var now = new Date();
var tbl_body = document.createElement("tbody");
var stop = "3072";
var results = "8";
/*var omaquery = '{\n stops(name: "3072") {\n  stoptimesWithoutPatterns(numberOfDepartures: 10) {\n   scheduledArrival\n   realtimeArrival\n   realtime\n   realtimeState\n   trip {\n    id\n    serviceId\n    tripShortName\n    tripHeadsign\n    gtfsId\n    route {\n     id\n     shortName\n    }\n   }\n   headsign\n  }\n }\n}';
*/
function getStop() { return stop };
function getResults() { return results };

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
        "ordering": false,
        "info": false,
        "autoWidth": false,
        "order": [[2, "asc"]],
        "ajax": {
            url: 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql',
            type: 'post',
            cache: false,
            data: function () {
                var omaquery = '{\n stops(name: "'
                    + getStop()
                    + '") {\n  stoptimesWithoutPatterns(numberOfDepartures: '
                    + getResults()
                    + ') { \n   scheduledArrival\n   realtimeArrival\n   realtime\n   realtimeState\n   trip { \n    id\n    serviceId\n    tripShortName\n    tripHeadsign\n    gtfsId\n    route { \n     id\n     shortName\n }\n}\n   headsign\n  }\n }\n}';
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
                    var timeSpan = new timeDiff(hslToJDate(row.realtimeArrival) - now);
                    return ("<span class=\"aikaa min\">" + timeSpan.eta + "</span>");
                }
            },
            {
                title: "",
                data: null,
                render: function (data, type, row) {
                    var timeSpan = new timeDiff(hslToJDate(row.realtimeArrival) - now);
                    if (timeSpan.minutesOut >= 4 && timeSpan.minutesOut < 8 && timeSpan.hoursOut < 1) {
                        return ('<img src="images/relaxing-walk.png" "alt="Walk" height="27" width="27">');
                    }
                    if (timeSpan.minutesOut >= 2 && timeSpan.minutesOut < 4 && timeSpan.hoursOut < 1) {
                        return ('<img src="images/running.png" "alt="Run" height="26" width="26">');
                    }
                    else {
                        return ("");
                    }
                    
                }
            }
        ]
    });

    $("#suunta").click(function () {
        if ($(this).text() == "Länteen") { $(this).text("Itään") } else { $(this).text("Länteen") }; 
        if (stop == "3072") { stop = "3071" } else { stop = "3072" };
        table.ajax.reload(null, false);
    });

    setInterval(function () {
        now = new Date();
        table.rows().invalidate('data').draw();
        
    }, 200);

    setInterval(function () {
        table.ajax.reload(null, false);
    }, 10000);


});