import path from 'path';
import Tail from 'tail';

export default class TailLogReader {
  constructor(handleLine, options = {}) {
    if (typeof handleLine !== 'function')
      throw new Error(
        'handleLine argument must be specified and be a function.'
      );
    if (!options.logDir) throw new Error('Log directory must be specified.');

    this.reader = new Tail(path.join(options.logDir, 'SquadGame.log'), {
      useWatchFile: true
    });

    this.reader.on('line', handleLine);
  }

  async watch() {
    this.reader.watch();
  }

  async unwatch() {
    this.reader.unwatch();
  }
}
