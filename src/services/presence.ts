
import { AutoWired, Singleton, Inject } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { BaseService } from '../base/BaseService';
import { EnvService } from './env';

@Singleton
@AutoWired
export class PresenceService extends BaseService {

  @Inject private envService: EnvService;

  public async init(client: Discord.Client): Promise<void> {
    await super.init(client);

    if (this.envService.ignorePresence) { return; }
    await this.setPresence('your custom status here, nerd');
  }

  public async setPresence(presence: string): Promise<void> {
    await this.client.user.setPresence({ game: { name: presence } });
  }
}
