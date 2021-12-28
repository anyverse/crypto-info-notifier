import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'src/common/Logger';
import TwitterConfig from 'src/configs/twitter.config';
import Twitter from 'twitter-v2';

export type Tweet = {
  id: string;
  author_id: string;
  text: string;
  created_at: string;
};
export type Tweets = {
  data: Array<{
    id: string;
    author_id: string;
    text: string;
    created_at: string;
  }>;
  includes: {
    users: Array<{
      id: string;
      name: string;
      username: string;
    }>;
  };
  meta: {
    oldest_id: string;
    newest_id: string;
    result_count: number;
    next_token: string;
  };
};

@Injectable()
export class TwitterClient {
  private logger = new Logger(TwitterClient.name);
  private client: Twitter;

  private cachedLastTweets: { [key: string]: Tweet & {userId: string} } = {}; // username -> last tweet
  constructor(
    @Inject(TwitterConfig.KEY)
    readonly twitterConfig: ConfigType<typeof TwitterConfig>,
  ) {
    this.client = new Twitter({
      consumer_key: this.twitterConfig.consumerKey,
      consumer_secret: this.twitterConfig.consumerSecret,
    });
  }

  public async getTweetsByUserName(username: string): Promise<Tweet | undefined> {

      let userId;
      if(!this.cachedLastTweets[username]){
        const user = await this.client.get(`users/by/username/${username}`);
        userId = (user as any).data.id;
      } else {userId= this.cachedLastTweets[username].userId}

    this.logger.debug(`${username}'s user id is ${userId}`);

    let params = {
      max_results: 100,
      'tweet.fields': 'created_at',
      expansions: 'author_id',
    };

    if (this.cachedLastTweets[username]) {
      params = Object.assign(params, {
        since_id: this.cachedLastTweets[username].id,
      });
    }

    const tweets: Tweets = await this.client.get(
      `users/${userId}/tweets`,
      params as any,
    );
    if (tweets.data && tweets.data.length > 0) {
      this.logger.debug(
        `total num of ${
          tweets.data.length
        } tweets found for ${username} and the latest one is: ${JSON.stringify(
          tweets.data[0],
        )}`,
      );
      this.cachedLastTweets[username] = {
          ...tweets.data[0],
          userId,
      };
      return tweets.data[0];
    } else {
      this.logger.debug(`no new tweet found for: ${username}`);
      return;
    }

  }
}
