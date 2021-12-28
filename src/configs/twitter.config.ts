import { registerAs } from '@nestjs/config';

export default registerAs('twitter', () => ({
  consumerKey: process.env.TWITTER_CONSUMER_KEY || "",
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET || "",
  watchedUsersJsonPath: process.env.TWITTER_WATCHED_USERS_JSON_PATH || ""
}));
