var noOfResults = 10;
var noOfCols = 6;
var tbl_body = document.createElement("tbody");
var now = new Date();
var debuggy; 
var omaquery = `{
	stops(name: "3072") {
		id
		name
		lat
		lon
		wheelchairBoarding
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
}`;

function hslToJDate(hslDate) {
    var convertedTime = new Date();
    convertedTime.setHours(0, 0, hslDate, 0);
    return convertedTime;
}

function timeDiff(msecs) {

    var milliseconds = parseInt((msecs % 1000) / 100);
    var seconds = parseInt((msecs / 1000) % 60);
    var minutes = parseInt((msecs / (1000 * 60)) % 60);
    var hours = parseInt((msecs / (1000 * 60 * 60)) % 24);

    this.negative = (hours < 0 || seconds < 0 || minutes < 0 || milliseconds < 0) ? "-" : "+";
 
    this.hoursOut = (Math.abs(hours) > 0) ? Math.abs(hours) + ":" : "";
    this.minutesOut = getMinutesOut(minutes, hours);
    this.secondsOut = getSecondsOut(minutes, seconds);
    this.all = this.negative + this.hoursOut + this.minutesOut + this.secondsOut;
    
    function getMinutesOut(minutes, hours) {
        var minutesOut;
        if (Math.abs(minutes) < 10) {
            if (Math.abs(hours) > 0) {
                minutesOut = "0" + Math.abs(minutes) + ":";
            }
            else {
                minutesOut = Math.abs(minutes) + ":";
            }
        }
        else if (Math.abs(minutes) >= 10) {
                minutesOut = Math.abs(minutes);
        }
        return minutesOut;
    }

    function getSecondsOut(minutes, seconds) {
        var secondsOut;
        if (Math.abs(minutes) < 10) {
            if (Math.abs(seconds) < 10) {
                if (Math.abs(seconds) == 0) {
                    secondsOut = "00";
                }
                else {
                    secondsOut = "0" + Math.abs(seconds);
                }
            }
            else if (Math.abs(seconds) >= 10) {
                secondsOut = Math.abs(seconds);
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
                render: function (data, type, row) { return ("<span class=\"saapumisaika\">" + dateFns.format(hslToJDate(data), "HH:mm") + "</span>") }
            },
            {
                title: "Erotus",
                data: null,
                render: function (data, type, row) {
                    var timeSpan = new timeDiff(hslToJDate(row.realtimeArrival) - hslToJDate(row.scheduledArrival));
                    return ("<span class=\"erotus\">" + timeSpan.all + "</span>");
                }
            },
            {
                title: "Aikaa",
                data: null,
                render: function (data, type, row) {
                    var timeSpan = new timeDiff(hslToJDate(row.realtimeArrival) - new Date());
                    return ("<span class=\"aikaa min\">" + timeSpan.all + "</span>");
                }
            }
        ]
    });

   //setInterval(function () { table.ajax.reload(null, false); }, 1000);

});