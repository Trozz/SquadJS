import SquadLayers from 'connectors/squad-layers';

import { LOG_PARSER_NEW_GAME } from '../../events/log-parser.js';

import InjuryHandler from '../utils/injury-handler.js';

export default {
  regex: /\[([0-9.:-]+)]\[([ 0-9]*)]LogWorld: Bringing World \/([A-z]+)\/Maps\/([A-z_]+)\/([A-z0-9_]+)/,
  action: async (args, logParser) => {
    /* Reset injury manager */
    logParser.injuryHandler = new InjuryHandler();

    const layer = SquadLayers.getLayerByLayerClassname(args[5]);

    /* Emit new game event */
    logParser.emitter.emit(LOG_PARSER_NEW_GAME, {
      raw: args[0],
      time: args[1],
      chainID: args[2],
      dlc: args[3],
      mapClassname: args[4],
      layerClassname: args[5],
      map: layer ? layer.map : null,
      layer: layer ? layer.layer : null
    });
  }
};
