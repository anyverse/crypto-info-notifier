import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Logger } from 'src/common/Logger';
import TwitterConfig from 'src/configs/twitter.config';
import TelegramConfig from 'src/configs/telegram.config';
import { TelegramClient } from 'src/integrations/TelegramClient';
import { TwitterClient } from 'src/integrations/TwitterClient';
import { TASK } from './enum';
import * as _ from 'lodash';

export const sleep = (delay = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delay));

@Injectable()
export class PollTwitterTask {
  private readonly logger = new Logger(PollTwitterTask.name);

  constructor(
    private twitterClient: TwitterClient,
    private telegramClient: TelegramClient,
    @Inject(TwitterConfig.KEY)
    private twitterConfig: ConfigType<typeof TwitterConfig>,
    @Inject(TelegramConfig.KEY)
    private telegramConfig: ConfigType<typeof TelegramConfig>,
  ) {}

  @Cron('* */5 * * * *', {
    name: TASK.TASK_TWITTER_MONITOR,
  })
  async handleCron() {
    this.logger.debug(`task scheduled to execute`);

    const users: string[] = require(`../../${this.twitterConfig.watchedUsersJsonPath}`);

    const chunks = _.chunk(users, 10);
    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (username) => {
          this.logger.debug(`pull tweet for: ${username}`);
          const tweet = await this.twitterClient.getTweetsByUserName(username);
          if (tweet) {
            try {
              const twitterUrl = `https://twitter.com/${username}/status/${tweet.id}?s=20`
              if (this.telegramConfig.enableTelegram) {
                await this.telegramClient.sendMessage(
                  `${username} tweet: ${twitterUrl}`,
                );
              } else {
                this.logger.debug(`skip telegram send`)
              }
            } catch (err) {
              this.logger.error(err);
            }
          }
        }),
      );
      await sleep();
    }
  }
}
