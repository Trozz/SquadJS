import DiscordConnector from 'connectors/discord';

import { COPYRIGHT_MESSAGE } from 'core/config';
import { LOG_PARSER_TEAMKILL } from 'squad-server/events/log-parser';

export default async function plugin(server, channelID, options = {}) {
  if (!server)
    throw new Error(
      'DiscordTeamKill must be provided with a reference to the server.'
    );

  if (!channelID)
    throw new Error('DiscordTeamkill must be provided with a channel ID.');

  options = {
    color: 16761867,
    ...options
  };

  const channel = await (await DiscordConnector.getClient()).channels.get(
    channelID
  );

  server.on(LOG_PARSER_TEAMKILL, info => {
    if (!info.attacker) return;

    channel.send({
      embed: {
        title: `Teamkill: ${info.attacker.name}`,
        color: options.color,
        fields: [
          {
            name: "Attacker's Name",
            value: info.attacker.name || 'Unknown',
            inline: true
          },
          {
            name: "Attacker's SteamID",
            value: info.attacker.steamID
              ? `[${info.attacker.steamID}](https://steamcommunity.com/profiles/${info.attacker.steamID})`
              : 'Unknown',
            inline: true
          },
          {
            name: 'Weapon',
            value: info.weapon || 'Unknown'
          },
          {
            name: "Victim's Name",
            value: info.victim.name || 'Unknown',
            inline: true
          },
          {
            name: "Victim's SteamID",
            value: info.victim.steamID
              ? `[${info.victim.steamID}](https://steamcommunity.com/profiles/${info.victim.steamID})`
              : 'Unknown',
            inline: true
          },
          {
            name: 'Squad Community Ban List',
            value: `${
              info.attacker.steamID
                ? `[Attacker's Bans](https://squad-community-ban-list.com/search/${info.attacker.steamID})`
                : "Cannot find attacker's ban page."
            }\n${
              info.victim.steamID
                ? `[Victims's Bans](https://squad-community-ban-list.com/search/${info.victim.steamID})`
                : "Cannot find victims's ban page."
            }`
          }
        ],
        timestamp: info.time.toISOString(),
        footer: {
          text: COPYRIGHT_MESSAGE
        }
      }
    });
  });
}
