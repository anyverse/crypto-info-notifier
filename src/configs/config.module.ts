import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { DynamicModule, Module } from '@nestjs/common';
import twitterConfig from 'src/configs/twitter.config';
import telegramConfig from './telegram.config';

export type ENV = 'local' | 'local-test' | 'ci' | 'test' | 'production' | 'dev';

@Module({})
export class ConfigModule {
  static forRoot(): DynamicModule {
    return NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve('env', `.${process.env.ENV}.env`),
      load: [twitterConfig, telegramConfig],
    });
  }
}
