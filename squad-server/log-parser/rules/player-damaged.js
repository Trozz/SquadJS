import { LOG_PARSER_PLAYER_DAMAGED } from '../../events/log-parser.js';

export default {
  regex: /^\[([0-9.:-]+)]\[([ 0-9]*)]LogSquad: Player:(.+) ActualDamage=([0-9.]+) from (.+) caused by ([A-z_0-9]+)/,
  onMatch: async (args, logParser) => {
    const data = {
      raw: args[0],
      time: args[1],
      chainID: args[2],
      victim: {
        name: args[3],
        ...(await logParser.server.getPlayerByName(args[3]))
      },
      damage: parseFloat(args[4]),
      attacker: {
        name: args[5],
        ...(await logParser.server.getPlayerByName(args[5]))
      },
      weapon: args[6]
    };

    logParser.server.emit(LOG_PARSER_PLAYER_DAMAGED, data);
  }
};
