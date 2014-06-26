var http 	= 	require('http'), 
	https 	= 	require('https'),
	url 	= 	require('url'), 
	request = 	require('request'), 
	Q 		=	require('q'),
	cheerio = 	require('cheerio');

Array.prototype.uniq = function() {
   var uniq = {}, arr = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(uniq.hasOwnProperty(this[i])) {
         continue;
      }
      arr.push(this[i]);
      uniq[this[i]] = 1;
   }
   return arr;
}

function getProtocol(url) {
	if(url.slice(0,5) == 'https') return https
	if(url.slice(0,4) == 'http') return http
}

module.exports.Scraper = function() {
	var _this = this;
	this.extmatch = function(path) {
		var extregexp = new RegExp(/.+\.([^?]+)(\?|$)/);
		return path && path.match(extregexp) && path.match(extregexp)[1];
	}
	this.getImages = function(url) {
		var promise = Q.defer();
		var candidates = ['thumb1', "thumb2", "thumbN"];
		promise.resolve(candidates);
		return promise.promise;
	}
	this.httpmatch = function(url) {
		var httpregexp = new RegExp(/^(\/\/|f|ht)tps?:\/\//i);
		if(url && url.indexOf("//") == 0) { return 'http:' + url;}
		if(url && url.match(httpregexp) && url.match(httpregexp)[0]) return url;
	}
	this.judge = function(finalists) {
		var promise = Q.defer();
		var medalists = [];
		promise.resolve(medalists);
		return promise.promise;
	}
	this.narrow = function(candidates) {
		var promise = Q.defer();
		var finalists = [];
		promise.resolve(finalists);
		return promise.promise;
	}
	this.scrape = function(address) {
		var promise = Q.defer();
		if(address) {
			_this.getImages(address).then(function(candidates) {
				_this.narrow(candidates).then(function(finalists) {
					_this.judge(finalists).then(function(medalists) {
						promise.resolve(medalists);
					});
				});
			});
		} else {
			promise.reject('Scraper cant scrape nil bro. Give me a url in the params.');
		}
		return promise.promise;
	}
}