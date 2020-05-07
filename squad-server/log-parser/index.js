import fs from 'fs';
import path from 'path';
import readline from 'readline';

import moment from 'moment';
import TailModule from 'tail';

import Server from '../index.js';
import rules from './rules/index.js';

const onNonMatchRules = rules.filter(
  rule => typeof rule.onNonMatch === 'function'
);
const onMatchRules = rules.filter(
  rule => typeof rule.onNonMatch !== 'function'
);

export default class LogParser {
  constructor(options = {}, server) {
    if (!options.logDir) throw new Error('Log Directory must be specified.');
    this.logDir = options.logDir;
    this.testMode = options.testMode || false;
    this.fileName = options.testModeFileName || 'SquadGame.log';

    if (!(server instanceof Server))
      throw new Error('Server not an instance of a SquadJS server.');
    this.server = server;

    this.setup();
  }

  setup() {
    if (this.testMode) {
      /* In test mode, we stream a log file line by line to simulate tail */
      this.reader = readline.createInterface({
        input: fs.createReadStream(path.join(this.logDir, this.fileName))
      });
      this.reader.pause();
    } else {
      /* In normal mode, we tail the file to get new lines as and when they are added */
      this.reader = new TailModule.Tail(path.join(this.logDir, this.fileName), {
        useWatchFile: true
      });
    }
    this.reader.on('line', this.handleLine.bind(this));
  }

  watch() {
    if (this.testMode) {
      this.reader.resume();
    } else {
      this.reader.watch();
    }
  }

  unwatch() {
    if (this.testMode) {
      this.reader.pause();
    } else {
      this.reader.unwatch();
    }
  }

  handleLine(line) {
    for (const rule of onNonMatchRules) {
      const match = line.match(rule.regex);

      if (match) {
        match[1] = moment.utc(match[1], 'YYYY.MM.DD-hh.mm.ss:SSS').toDate();
        match[2] = parseInt(match[2]);
        rule.onMatch(match, this);
      } else {
        rule.onNonMatch(this);
      }
    }

    for (const rule of onMatchRules) {
      const match = line.match(rule.regex);
      if (!match) continue;

      match[1] = moment.utc(match[1], 'YYYY.MM.DD-hh.mm.ss:SSS').toDate();
      match[2] = parseInt(match[2]);
      rule.onMatch(match, this);
      break;
    }
  }
}
