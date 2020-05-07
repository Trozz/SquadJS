import { LOG_PARSER_PLAYER_REVIVE } from '../../events/log-parser.js';

export default {
  regex: /\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: (.+) has revived (.+)./,
  onMatch: async (args, logParser) => {
    const data = {
      raw: args[0],
      time: args[1],
      chainID: args[2],
      victim: {
        name: args[3],
        ...(await logParser.server.getPlayerByName(args[3]))
      },
      reviver: {
        name: args[4],
        ...(await logParser.server.getPlayerByName(args[5]))
      }
    };

    logParser.server.emit(LOG_PARSER_PLAYER_REVIVE, data);
  }
};
