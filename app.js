var fs = require('fs');
var express = require('express');
var request = require('request');
var moment = require('moment');
var _ = require('lodash');

var app = express();
app.use(express.static(__dirname + '/public'));

var API_KEY = "u6je278zwfzyv6tt2c64bxfv";
var BASE_URL = "http://data.tmsapi.com/v1.1";
var zipCode = "10001";
var d = new Date();
var today = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();

var sampleData = JSON.parse(fs.readFileSync('public/sample.json', 'utf8'));

app.get('/list', function(req, res) {
	var movies = [];
	_.forEach(sampleData, function(value, key) {
		movies.push({
			title: value['title'] + ' (' + value['releaseYear'] + ')'
		});
	});

	res.send(JSON.stringify(movies));
});

app.get('/:movie_title', function (req, res) {
	// request({
	//     url: BASE_URL + '/movies/showings',
	//     qs: { 
	//     	startDate: today,
	//         zip: zipCode,
	//         api_key: API_KEY
	//     },
	//     method: 'GET'
	// }, function (error, response, body) {
	// 	console.log(arguments);
	// 	if (!error) {
 //    		res.json(JSON.parse(body));
	// 	}
	// });

	console.log('Searching for: ' + req.params.movie_title);
	var movies = _.filter(sampleData, function(o) { 
		return (o.title.toLowerCase().indexOf(req.params.movie_title.toLowerCase()) > -1); 
	});

	if(movies.length > 0) {

		var responseText = '';
		console.log('Found: ' + movies.length);

		_.forEach(movies, function(movie, key) {

			var now = new Date();
			var nextShowtimes = _.filter(movie.showtimes, function(o) {
				return parseInt(o['dateTime'].split('T')[1].split(":").join('')) > parseInt(now.getHours().toString() + '' + now.getMinutes().toString());
			});
			if(nextShowtimes.length > 0) {
				var showTimings = _.sortBy(nextShowtimes, [function(o) {
					return parseInt(o['dateTime'].split('T')[1].split(":").join(''));
				}]);
				responseText += '<p>Next show for: ' + movie.title + ' is in ' + showTimings[0].theatre.name + ' @ ' + showTimings[0].dateTime.split('T')[1] + '</p>';	
			} else {
				responseText += '<p>No more shows for ' + movie.title + ' today!</p>';
			}

		});

		res.send(responseText);

		
	} else {
		res.send('Sorry, couldn\'t locate any shows for ' + req.params.movie_title);
	}

	// res.json(sampleData);
});

app.listen(9001, function () {
  console.log('Alexa skill app listening on port 9001!');
});

//polyfill for Array.isArray
Array.isArray||(Array.isArray=function(a){return''+a!==a&&{}.toString.call(a)=='[object Array]'});