import {  Module } from '@nestjs/common';
import {TwitterClient} from 'src/integrations/TwitterClient';
import { TelegramClient } from './TelegramClient';

@Module({
    providers: [TwitterClient, TelegramClient],
    exports: [TwitterClient, TelegramClient]
})
export class IntegrationModule {

}