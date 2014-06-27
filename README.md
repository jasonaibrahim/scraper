# scraper-js
![ScreenShot](https://raw.githubusercontent.com/jasonaibrahim/scraper/master/raw/510.jpg)

need thumbnails? scraper will crawl a page and return a list of images that best represent the page. just give it a url and tell it to scrape.

installation
------------  
	npm install scraper-js

use
------------
	var scraper = require('scraper-js');
	var scrapy = new scraper.Scraper();
	scrapy.scrape(address).then(function(thumbs) {
		console.log(thumbs);
	});

example
------------
	var http = require('http'), url = require('url'), scraper = require('scraper-js');
	var server = http.createServer(function(req, res) {
		var query = url.parse(req.url, true).query;
		var address = query.url; // e.g http://www.rollingstone.com
		var scrapy = new scraper.Scraper();
		
		scrapy.scrape(address).then(function(thumbs) {
			res.end(JSON.stringify(thumbs));
		}, function(error) {
			res.writeHead(404);
			res.end(error);
		});
		// result: ["http://assets-s3.rollingstone.com/images/logo-1200x630.jpg","http://assets-s3.rollingstone.com/assets/images/list_container/45-best-albums-of-2014-so-far-20140626/20140623-skrillex-624-1403629273.jpg","http://assets-s3.rollingstone.com/assets/images/story/beyonce-and-jay-zs-on-the-run-tour-opener-a-collaborative-spectacle-20140626/beyonce-624-1403794830.jpg"]
	}).listen(8080);

scrape() will return a promise, that when fulfilled, will return an array of candidate thumbnails- in the form of url's- in descending order of rating; i.e. the best candidate thumbnail will appear first. 

scraper is a lightweight npm module designed to return high quality and highly relevant images fast.
