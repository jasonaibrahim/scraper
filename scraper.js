/*global require: true, module: true*/
var http = require('http'),
    https = require('https'),
    url = require('url'),
    request = require('request'),
    Q = require('q'),
    cheerio = require('cheerio');

/** returns a new array with duplicates removed */
Array.prototype.uniq = function () {
    'use strict';
    var uniq = {}, arr = [], i;
    for (i = 0; i < this.length; i += 1) {
        if (!uniq.hasOwnProperty(this[i])) {
            arr.push(this[i]);
            uniq[this[i]] = 1;
        }
    }
    return arr;
};
/** returns an array that contains only the differences between this array and the one passed in */
Array.prototype.diff = function (list) {
    'use strict';
    var diffs = [], i;
    for (i = 0; i < this.length; i += 1) {
        if (list.indexOf(this[i]) > -1) {
            diffs.push(this[i]);
        }
    }
    return diffs;
};

/** based on the url string passed in, return the proper node http module to use */
var getProtocol = function (url) {
    'use strict';
    // TODO this function can be safer, by checking if https or http exists. also what if the url is invalid?
    if (url.slice(0, 5) === 'https') { return https; }
    if (url.slice(0, 4) === 'http') { return http; }
    return null;
};

/** define the node module */
module.exports.Scraper = function () {
    'use strict';
    var self = this;

    this.clean = function (candidates) {
        // TODO use a regex for checking the extname
        var clean = [], i;
        for (i in candidates) {
            if (self.httpmatch(candidates[i]) &&
                (self.extmatch(candidates[i]) === 'jpg' ||
                    self.extmatch(candidates[i]) === 'png' ||
                    self.extmatch(candidates[i]) === 'gif')) {
                clean.push(self.httpmatch(candidates[i]));
            }
        }
        return clean.uniq();
    };

    this.extmatch = function (path) {
        if (!path) { return null; }
        var extRegex = new RegExp(/.+\.([^?]+)(\?|$)/);
        return path && path.match(extRegex) && path.match(extRegex)[1];
    };

    this.getImages = function (url) {
        var promise = Q.defer(), candidates = [];
        if (self.clean([url]).length > 0) {
            promise.resolve([url]);
            return promise.promise;
        }
        request(url, function (error, response, html) {
            if (!error && response.statusCode === 200) {
                var $ = cheerio.load(html), imagetags = $('img'), metatags = $('meta'), i;
                for (i = 0; i < imagetags.length; i += 1) {
                    candidates.push(imagetags[i].attribs.src);
                }
                for (i = 0; i < metatags.length; i += 1) {
                    candidates.push(metatags[i].attribs.content);
                }
                candidates = self.clean(candidates);
                promise.resolve(candidates);
            } else {
                promise.reject(new Error('Bad Request'));
            }
        });
        return promise.promise;
    };

    this.httpmatch = function (url) {
        var httpRegex = new RegExp(/^(\/\/|f|ht)tps?:\/\//i);
        if (url && url.indexOf("//") === 0) { return 'http:' + url; }
        if (url && url.match(httpRegex) && url.match(httpRegex)[0]) { return url; }
        return null;
    };

    this.judge = function (finalists, address) {
        var promise = Q.defer(), medalists = [], keywords = self.parse(address), i;
        for (i = 0; i < finalists.length; i += 1) {
            medalists.push(finalists[i]);
        }
        promise.resolve(medalists);
        return promise.promise;
    };

    this.minSize = function (finalist) {
        return finalist.size > 1000;
    };

    this.narrow = function (candidates) {
        var promise = Q.defer(), finalists = [], seen = 0, i, j;
        for (i = 0; i < candidates.length; i += 1) {
            request({url: candidates[i], method: 'HEAD'}, function (error, response) {
                if (response) {
                    finalists.push({
                        url: response.request.href,
                        size: response.headers['content-length']
                    });
                }
                if ((seen += 1) === candidates.length) {
                    finalists = finalists.filter(self.minSize);
                    finalists.sort(function (a, b) {
                        return b.size - a.size;
                    });
                    for (j = 0; j < finalists.length; j += 1) {
                        finalists[j] = finalists[j].url;
                    }
                    promise.resolve(finalists);
                }
            });

        }
        return promise.promise;
    };

    this.parse = function (url) {
        // break the url into as many distinct words as possible.
        var wordRegex = new RegExp(/^(http|https|www|com)/),
            words = url.split('/').filter(function (el) { return el !== ''; }),
            parsed = [],
            i,
            j,
            subwords;
        for (i = 0; i < words.length; i += 1) {
            if (!words[i].match(wordRegex)) {
                subwords = words[i].split('.');
                if (subwords.length > 0) {
                    for (j = 0; j < subwords.length; j += 1) {
                        if (!subwords[j].match(wordRegex)) {
                            parsed.push(subwords[j]);
                        }
                    }
                } else {
                    parsed.push(words[i]);
                }
            }
        }
        return parsed;
    };

    this.scrape = function (address) {
        var promise = Q.defer();
        if (address) {
            self.getImages(address).then(function (candidates) {
                self.narrow(candidates).then(function (finalists) {
                    self.judge(finalists, address).then(function (medalists) {
                        promise.resolve(medalists);
                    });
                });
            });
        } else {
            promise.reject('Scraper cant scrape nil. Feed it a url in the params.');
        }
        return promise.promise;
    };
};
