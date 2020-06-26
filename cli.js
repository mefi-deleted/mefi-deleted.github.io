#!/usr/bin/env node
'use strict';

const meow = require('meow');
const router = require('./src/router');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({ pkg }).notify();

const cli = meow(`
Usage

   $ mefi-deleted <command> <params>

   $ mefi-deleted sample <param>             # Uses the <PARAM>
   $ mefi-deleted other <param>              # Other the <PARAM>
   $ mefi-deleted another <param>            # Another the <PARAM>
   
 Examples

   $ mefi-deleted sample TEST                # Uses the TEST
   $ mefi-deleted sample YOLO                # Uses the YOLO
   $ mefi-deleted other YOLO                 # Uses the YOLO
   $ mefi-deleted another YOLO               # Uses the YOLO
`,
  {
    alias: {
      v: 'version'
    },
    boolean: ['version']
  }
);

if (cli.input.length > 0) {
	router.init(cli.input, cli.flags);
} else {
	cli.showHelp(2);
}