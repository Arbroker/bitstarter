#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

 + URL
   - http://nodejs.org/docs/latest/api/url.html#url_url_resolve_from_to
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var url = require('url');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://startup-eng.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
    return instr;
};

var cheerioHtml = function(htmlfile) {
    return cheerio.load(htmlfile);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlPath = function(htmlfile,checksfile) {
    //var cheerioHtml = cheerioHtmlPath(htmlfile);
    var checkHtml = function(htmlfile) {
	$ = cheerioHtml(htmlfile);
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks) {
	    var present = $(checks[ii]).length > 0;
	    out[checks[ii]] = present;
	    }
	console.log(JSON.stringify(out, null, 4));
	return out;
	};
    return checkHtml;
};

var checkHtmlFile = function(fname,cname) {
    $ = cheerioHtml(fs.readFileSync(fname));
    var checks = loadChecks(cname).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
	}
    return out;
};

if(require.main == module) {
    program
    .option('-c, --checks ', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
    .option('-f, --file ', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
    .option('-u, --url ', 'Path to index.html on the web', assertFileExists, HTMLFILE_DEFAULT)
    .parse(process.argv);
/*
I actually didn't use an explicit "assertUrlExists", but rather a function that uses 
restler to simply get the html from my web page. If the Url doesn't exist then when 
it passes through the restler function (at least in my case), it will give an error 404 
or something similar. You can see the restler implementation with this kind of error 
message in the restler readme. On top of that, all the checks will be given as false, 
so you'd know something is wrong.
*/
    var checkJson;
    if (program.file) {
	checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
	}
    if (program.url) {
	var urlPath = url.resolve(program.args[2],program.url);
	var checkJson = checkHtmlPath(urlPath,program.checks);
	rest.get(urlPath).on('complete', checkJson);
	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
    exports.checkHtmlPath = checkHtmlPath;
}
