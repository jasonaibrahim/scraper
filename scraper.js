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
};
Array.prototype.diff = function(list) {
	var ret = [];
	for(i in this) {
		if(list.indexOf( this[i] ) > -1) {
			ret.push(this[i]);
		}
	}
	return ret;
};

function getProtocol(url) {
	if(url.slice(0,5) == 'https') return https
	if(url.slice(0,4) == 'http') return http
};

module.exports.Scraper = function() {
	var _this = this;
	this.clean = function(candidates) {
		var clean = [];
		for(var i = 0; i < candidates.length; i++) {
			if(	_this.httpmatch(candidates[i]) && 
			(	_this.extmatch(candidates[i]) == 'jpg' 	|| 
				_this.extmatch(candidates[i]) == 'png' 	|| 
				_this.extmatch(candidates[i]) == 'gif'	)) 
			{
				clean.push(_this.httpmatch(candidates[i]));
			}
		}
		return clean.uniq();
	}
	this.extmatch = function(path) {
		if(!path) return null;
		var extregexp = new RegExp(/.+\.([^?]+)(\?|$)/);
		return path && path.match(extregexp) && path.match(extregexp)[1];
	}
	this.getImages = function(url) {
		var promise = Q.defer();
		var candidates = [];
		if(_this.clean([url]).length > 0){
			promise.resolve([url]);
			return promise.promise;
		}
		request(url, function(error, response, html) {
			if(!error && response.statusCode == 200) {
				var $ = cheerio.load(html);
				var imagetags = $('img');
				var metatags = $('meta');
				for(var i=0; i<imagetags.length; i++){
					candidates.push(imagetags[i].attribs.src);
				}
				for(var i=0; i<metatags.length; i++){
					candidates.push(metatags[i].attribs.content);
				}
				candidates = _this.clean(candidates);
				promise.resolve(candidates);
			} else {
				promise.reject(new Error('Bad Request'));
			}
		});
		return promise.promise;
	}
	this.httpmatch = function(url) {
		var httpregexp = new RegExp(/^(\/\/|f|ht)tps?:\/\//i);
		if(url && url.indexOf("//") == 0) { return 'http:' + url;}
		if(url && url.match(httpregexp) && url.match(httpregexp)[0]) return url;
	}
	this.judge = function(finalists, address) {
		var promise = Q.defer();
		var medalists = [];
		var keywords = _this.parse(address);
		for(var i=0; i<finalists.length; i++) {
			medalists.push(finalists[i]);
		}
		promise.resolve(medalists);
		return promise.promise;
	}
	this.minSize = function(finalist) {
		if(finalist.size > 1000) {
			return true;
		}
		return false;
	}
	this.narrow = function(candidates) {
		var promise = Q.defer();
		var finalists = [];

		var seen = 0;
		for(var i=0; i<candidates.length; i++) {
			request({
				url: candidates[i],
				method: 'HEAD'
			}, function(error, response, body) {
				finalists.push({
					url: response.request.href,
					size: response.headers['content-length']
				});
				if(++seen == candidates.length) {
					finalists = finalists.filter(_this.minSize);
					finalists.sort(function(a,b) {
						return b.size - a.size;
					});
					for(var j= 0; j<finalists.length; j++) {
						finalists[j] = finalists[j].url;
					}
					promise.resolve(finalists);
				}
			});
			
		}
		return promise.promise;
	}
	this.parse = function(url) {
		// break the url into as many distinct words as possible.
		var wordreg = new RegExp(/^(http|https|www|com)/);
		var words = url.split('/').filter(function(el){return( el != "")});
		var parsed = [];
		for(var i=0; i<words.length; i++) {
			if(!words[i].match(wordreg)){
				var subwords = words[i].split(".");
				if(subwords.length > 0) {
					for(var j=0; j<subwords.length; j++) {
						if(!subwords[j].match(wordreg)) {
							parsed.push(subwords[j]);
						}
					}
				} else {
					parsed.push(words[i]);
				}
			}
		}
		return parsed;
	}
	this.scrape = function(address) {
		var promise = Q.defer();
		if(address) {
			_this.getImages(address).then(function(candidates) {
				_this.narrow(candidates).then(function(finalists) {
					_this.judge(finalists, address).then(function(medalists) {
						promise.resolve(medalists);
					});
				});
			});
		} else {
			promise.reject('Scraper cant scrape nil bro. Give me a url in the params.');
		}
		return promise.promise;
	}
};