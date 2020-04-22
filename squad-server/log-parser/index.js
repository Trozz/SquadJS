import moment from 'moment';

import TailLogReader from './log-readers/tail.js';
import FTPLogReader from './log-readers/ftp.js';

import rules from './rules/index.js';

export default class LogParser {
  constructor(options = {}, emitter) {
    this.emitter = emitter;
    this.handleLine = this.handleLine.bind(this);

    switch (options.logReaderMode || 'tail') {
      case 'tail':
        this.logReader = new TailLogReader(options, this.handleLine);
        break;
      case 'ftp':
        this.logReader = new FTPLogReader(options, this.handleLine);
        break;
      default:
        throw new Error('Invalid mode.');
    }
  }

  async watch() {
    await this.logReader.watch();
  }

  async unwatch() {
    await this.logReader.unwatch();
  }

  handleLine(line) {
    let canBreak = false;

    for (const rule of rules) {
      if (rule === 'END_NO_MATCH_ACTION') {
        canBreak = true;
        continue;
      }

      const match = line.match(rule.regex);

      if (match) {
        match[1] = moment.utc(match[1], 'YYYY.MM.DD-hh.mm.ss:SSS').toDate();
        match[2] = parseInt(match[2]);
        rule.action(match, this);
        if (canBreak) break;
      } else {
        if (rule.noMatchAction) rule.noMatchAction(this);
      }
    }
  }
}
