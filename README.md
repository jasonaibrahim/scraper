# scraper-js

<img src="https://raw.githubusercontent.com/jasonaibrahim/scraper/master/raw/510.jpg" width="300">

overview
-----------
need thumbnails? scraper is a lightweight npm module designed to return high quality and highly relevant images from a source url fast. 

installation
------------  
	npm install scraper-js

use
------------
	var Scraper = require('scraper-js').Scraper();
	var scraper = new Scraper.Scraper();
	scraper.scrape(address).then(function (thumbs) {
		console.log(thumbs);
	});

example node server
------------
```javascript
//
// scraperapp
// 
// thumbnail scraping http server. usage is as follows:
// get the address to scrape from the parameters passed to the url
// e.g. localhost:1337/scrape?url=http://www.reddit.com; address to scrape => http://www.reddit.com
// response will be an array of image urls => [http://image1.jpg, http://image2.jpg, ...]
//
// authored by Jason Ibrahim
// copyright (c) 2015 Jason Ibrahim
// 

// initialize dependencies
var http =	require('http'),
    https =	require('https'),
    url = require('url'),
    Scraper = require('scraper-js');
    
// set the port
var port = process.env.port || 80;

// create the server
var server = http.createServer(function (req, res) {
    
	var scrapereg = new RegExp(/^(\/scrape)/),
        query = url.parse(req.url, true).query,
        address = query.url,
        scraper = new Scraper.Scraper();
	// only listen for api calls to /scrape
	if(!req.url.match(scrapereg)) {
		res.writeHead(404);
		res.end('Did you mean /scrape?');
	}
	res.writeHead(200, {'Access-Control-Allow-Origin': "*"});
    // scraper returns a promise that will resolve an array of image urls
	scraper.scrape(address).then(function (images) {
		res.end(JSON.stringify(images));
	}, function(error) {
		res.writeHead(404);
		res.end(JSON.stringify([error]));
	});
	// if we don't get at least one thumbnail within 8 seconds, quit
	setTimeout(function() {
        res.writeHead(408);
		res.end(JSON.stringify(['timeout.']));
	}, 8000);
    
}).listen(port);

console.log('Scraping on', port);
```

details
------------
scrape() will return a promise, that when fulfilled, will return an array of candidate thumbnails- in the form of url's- in descending order of rating; i.e. the best candidate thumbnail will appear first. 

contributions
------------
improvements, features, bug fixes and any other type of contribution are welcome to this project. please feel free to extend what has been started here and if it solves a particular problem, please submit a pull request so we can share it with others.
