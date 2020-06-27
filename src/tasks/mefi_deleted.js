#!/usr/bin/env node
'use strict';

const Chalk = require('chalk');
const log = console.log;
const fs = require('fs');
const Utils = require('../utils/utils');
const fetch = require('node-fetch');
const FeedParser = require('feedparser');
const cheerio = require('cheerio');
const moment = require('moment');
const sanitize = require("sanitize-filename");
const yaml = require('js-yaml');

const sites = {
  'blue': {url: 'http://feeds.feedburner.com/Metafilter', subdomain: 'www'},
  'green': {url: 'http://feeds.feedburner.com/AskMetafilter', subdomain: 'ask'},
};

var activeSite;

const postIds = [];

// Main code 
// based partially on the feedparser example https://github.com/danmactough/node-feedparser/blob/HEAD/examples/complete.js
const self = module.exports = {
	init: input => {

		if (input.length == 0 || ! Object.keys(sites).includes(input[0])) {
			log(Chalk.red('Specify a valid site'));
			return;
		}
	  
	  activeSite = input[0];
	  get(sites[activeSite].url);
	}
};

// based on the feedparser example https://github.com/danmactough/node-feedparser/blob/HEAD/examples/complete.js
function get(feed) {
  // Get a response stream
  fetch(feed, { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36', 'accept': 'text/html,application/xhtml+xml' }).then(function (res) {

    // Setup feedparser stream
    var feedparser = new FeedParser();
    feedparser.on('error', done);
    feedparser.on('end', done);
    feedparser.on('readable', function() {
      var post;
      while (post = this.read()) {
        const match = post['link'].match(/\/(\d+)\//);
        if (match !== undefined && match.length > 0)
        postIds.push(parseInt(match[1]));
      }
    });

    // Handle our response and pipe it to feedparser
    if (res.status != 200) throw new Error('Bad status code');
    var charset = getParams(res.headers.get('content-type') || '').charset;
    var responseStream = res.body;
    responseStream = maybeTranslate(responseStream, charset);
    // And boom goes the dynamite
    responseStream.pipe(feedparser);

  }).catch(done);
}

function maybeTranslate (res, charset) {
  var iconvStream;
  // Decode using iconv-lite if its not utf8 already.
  if (!iconvStream && charset && !/utf-*8/i.test(charset)) {
    try {
      iconvStream = iconv.decodeStream(charset);
      console.log('Converting from charset %s to utf-8', charset);
      iconvStream.on('error', done);
      // If we're using iconvStream, stream will be the output of iconvStream
      // otherwise it will remain the output of request
      res = res.pipe(iconvStream);
    } catch(err) {
      res.emit('error', err);
    }
  }
  return res;
}

function getParams(str) {
  var params = str.split(';').reduce(function (params, param) {
    var parts = param.split('=').map(function (part) { return part.trim(); });
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
    return params;
  }, {});
  return params;
}

function done(err) {
  if (err) {
    console.log(err, err.stack);
    return process.exit(1);
  }
  const missingIds = findMissingPostIds(postIds);
  missingIds.forEach(id => processDeletedPost(id));
}

// post ids are normally in numeric sequence. find any gaps and add them to an array
function findMissingPostIds(postIds) {
  const missing = [];
  for (var i=1; i<postIds.length; i++) {
    if (postIds[i-1]-1 != postIds[i]) {
      missing.push(postIds[i]+1);
    }
  }
  return missing;
}

// fetch the deleted post from mefi and pull out the title, date, deletion reason, etc...
function processDeletedPost(id) {
  const url = `https://${sites[activeSite].subdomain}.metafilter.com/${id}`;
  fetch(url)
  .then(response => response.text())
  .then(data => {
    const $ = cheerio.load(data);
    
    const dateStr = $('h1.posttitle > span.smallcopy').contents().not($('h1.posttitle > span.smallcopy').children()).text().trim();
    const date = moment(dateStr, "MMMM D, YYYY")
    const dateFormatted = date.format(moment.HTML5_FMT.DATE);
    
    const postData = {
        id: id,
        url: url,
        title: $('h1.posttitle').contents().not($('h1.posttitle').children()).text().replace(/\n/g,''),
        date: date,
        dateFormatted: dateFormatted,
        reason: $('p.reason').html()
      }
    writePost(postData);  
  });
}


function writePost(postData) {
  const yamlData = {
    layout: 'post',
    title: postData.title,
    date: postData.date.toDate(),
    categories: [activeSite],
  }
  const yamlStr = yaml.safeDump(yamlData);
  
  const outData = `---
${yamlStr}
---
Post <a href="${postData.url}">${postData.id}</a> deleted: <br /> ${postData.reason}
`
  fs.writeFile(`./mefideleted-blog/_posts/${sanitize(postData.dateFormatted)}-${sanitize(activeSite)}-${sanitize(postData.id.toString())}.html`, outData, function (err) {
    if (err) throw Error(err);
  });
}
