
import * as Discord from 'discord.js';
import { Inject } from 'typescript-ioc';

import { ICommandResult } from './interfaces';

import { LoggerService } from './services/logger';
import { CommandParser } from './services/command-parser';
import { PresenceService } from './services/presence';
import { EnvService } from './services/env';
import { BlankService } from './services/blank';

export class Bot {
  @Inject private logger: LoggerService;
  @Inject private envService: EnvService;
  @Inject private presenceService: PresenceService;
  @Inject private blankService: BlankService;
  @Inject private commandParser: CommandParser;

  public async init(): Promise<void> {
    const DISCORD_TOKEN = this.envService.discordToken;
    const COMMAND_PREFIX = this.envService.commandPrefix;
    if (!DISCORD_TOKEN) { throw new Error('No Discord token specified!'); }

    const client = new Discord.Client();
    client.login(DISCORD_TOKEN);

    client.on('ready', () => {
      this.logger.log('Initialized bot!');

      this.envService.init(client);
      this.presenceService.init(client);
      this.blankService.init(client);
      this.commandParser.init(client);
    });

    client.on('message', async (msg) => {
      if (msg.author.bot || msg.author.id === client.user.id) { return; }

      if (this.envService.testServerId && this.envService.testServerId !== msg.guild.id) { return; }

      const content = msg.content;

      if (content.startsWith(COMMAND_PREFIX)) {
        const result: ICommandResult = await this.commandParser.handleCommand(msg);
        this.logger.logCommandResult(result);

      } else {
        this.commandParser.handleMessage(msg);

      }
    });

    client.on('messageReactionAdd', async (reaction, user) => {
      if (user.bot) { return; }

      this.commandParser.handleEmojiAdd(reaction, user);
    });

    client.on('messageReactionRemove', async (reaction, user) => {
      if (user.bot) { return; }

      this.commandParser.handleEmojiRemove(reaction, user);
    });
  }
}
