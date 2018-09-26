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
    convertedTime.setHours(0, 0, hslDate, 0)
    return convertedTime;
}

function timeDiff(msecs) {
    var milliseconds = parseInt((msecs % 1000) / 100),
        seconds = parseInt((msecs / 1000) % 60),
        minutes = parseInt((msecs / (1000 * 60)) % 60),
        hours = parseInt((msecs / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}

$(document).ready(function () {

    var table = $('#aikataulu').DataTable({
        "paging": false,
        "processing": true,
        "searching": false,
        "order": [[3, "asc"]],
        "ajax": {
            url: 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql',
            type: 'post',
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
                data: "trip.route.shortName"
            },
            {
                title: "Määränpää",
                data: "headsign"
            },
            {
                title: "Aikataulu",
                data: "scheduledArrival", 
                render: function (data, type, row) { return $.format.date(hslToJDate(data), "HH:mm:ss") }
            },
            {
                title: "Todellinen",
                data: "realtimeArrival",
                render: function (data, type, row) { return $.format.date(hslToJDate(data), "HH:mm:ss") }
            },
            {
                title: "Erotus",
                data: null,
                render: function (data, type, row) { return timeDiff(hslToJDate(row.realtimeArrival) - hslToJDate(row.scheduledArrival)) }
            },
            {
                title: "Aikaa",
                data: null,
                render: function (data, type, row) { return timeDiff(hslToJDate(row.realtimeArrival) - now) }
            }
        ]
    });

//    setInterval(function () { table.ajax.reload(null, false); }, 2000);

});