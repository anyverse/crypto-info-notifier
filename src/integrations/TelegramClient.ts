import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'src/common/Logger';
import TelegramConfig from 'src/configs/telegram.config';
const TG = require('telegram-bot-api');

@Injectable()
export class TelegramClient {
  private logger : Logger = new Logger(TelegramClient.name)

  private api;
  constructor(
    @Inject(TelegramConfig.KEY)
    private telegramConfig: ConfigType<typeof TelegramConfig>,
  ) {
    this.api = new TG({
      token: telegramConfig.botToken,
    });
  }

  public sendMessage(text: string) {
    return new Promise((resolve, reject) => {
      this.api.sendMessage({
        chat_id:`@${this.telegramConfig.chatId}`,
        text:text,
      }).then((res :any) => {
        resolve(res)
      }).catch((err : any)=> {
        this.logger.error(err)
        reject(err)
      })
    })
    
  }
}
