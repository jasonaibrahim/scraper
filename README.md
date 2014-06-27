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
	var address = "http://www.rollingstone.com";
	scrapy.scrape(address).then(function(images) {
		return JSON.stringify(images);
	});

scrape() will return a promise, that when fulfilled, will return an array of candidate thumbnails- in the form of url's- in descending order of rating; i.e. the best candidate thumbnail will appear first. 

scraper is a lightweight npm module designed to return high quality and highly relevant images fast. if scraper doesn't find a candidate thumbnail within 5 seconds, it returns an empty list.  

