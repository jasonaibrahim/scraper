//  scraper-js 1.0.0
//  http://github.com/jasonaibrahim/scraper
//  (c) 2014-2015 Jason Ibrahim
//  scraper may be freely distributed under the MIT license.

// global require: true, module: true

var http = require('http'),
    https = require('https'),
    url = require('url'),
    request = require('request'),
    Q = require('q'),
    cheerio = require('cheerio'),
    _ = require('underscore');

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

    // iterate through a list of candidate urls and return a set of only those which match jpg, png or gif
    function clean (candidates) {
        // TODO use a regex for checking the extname
        var cleanCandidates = [], i;
        for (i in candidates) {
            if (httpmatch(candidates[i]) &&
                (extmatch(candidates[i]) === 'jpg' ||
                    extmatch(candidates[i]) === 'png' ||
                    extmatch(candidates[i]) === 'gif')) {
                cleanCandidates.push(httpmatch(candidates[i]));
            }
        }
        return _.uniq(cleanCandidates);
    }

    // check if the string passed in has a filename extension and return the extension
    function extmatch (path) {
        if (!path) { return null; }
        var extRegex = new RegExp(/.+\.([^?]+)(\?|$)/);
        return path && path.match(extRegex) && path.match(extRegex)[1];
    }

    // given a url, return a deferred list of possible images found on that page
    function getImages (url) {
        var promise = Q.defer(), candidates = [];
        if (clean([url]).length > 0) {
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
                candidates = clean(candidates);
                promise.resolve(candidates);
            } else {
                promise.reject(new Error('Bad Request'));
            }
        });
        return promise.promise;
    }

    // prefix a string with http: and/or return the string if it matches a valid url, otherwise return null
    function httpmatch (url) {
        var httpRegex = new RegExp(/^(\/\/|f|ht)tps?:\/\//i);
        if (url && url.indexOf("//") === 0) { return 'http:' + url; }
        if (url && url.match(httpRegex) && url.match(httpRegex)[0]) { return url; }
        return null;
    }

    // this function is designed to further determine whether a list of candidate images are considered 'good'
    // as of right now, these simply return the list passed in.
    function judge (finalists, address) {
        var promise = Q.defer();
        // TODO return only the best images in the list of finalists candidates
        promise.resolve(finalists);
        return promise.promise;
    }

    // from a list of candidate images, filter those below a certain size threshold.
    function narrow (candidates) {
        var promise = Q.defer(), finalists = [], seen = 0, i, j;
        // helper to filter images that are smaller than 1000 bytes
        function minsize (finalist) {
            return finalist.size > 1000;
        }

        for (i = 0; i < candidates.length; i += 1) {
            request({url: candidates[i], method: 'HEAD'}, function (error, response) {
                if (response) {
                    finalists.push({
                        url: response.request.href,
                        size: response.headers['content-length']
                    });
                }
                if ((seen += 1) === candidates.length) {
                    finalists = finalists.filter(minsize);
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
    }

    // break the url into as many distinct words as possible.
    function parse (url) {
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
    }

    // the scraper api. takes in a page url, returns a deferred list of image urls.
    this.scrape = function (address) {
        var deferred = Q.defer();
        if (address) {
            getImages(address)
                .then(function (candidates) { narrow(candidates)
                .then(function (finalists) { judge(finalists, address)
                .then(function (medalists) {
                    deferred.resolve(medalists);
                })
            })
        })}
        else {
            deferred.reject('Scraper cant scrape nil. Feed it a url in the params.');
        }
        return deferred.promise;
    };
};