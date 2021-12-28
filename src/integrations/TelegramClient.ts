import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Logger } from 'src/common/Logger';
import TelegramConfig from 'src/configs/telegram.config';
const Slimbot = require('slimbot');
const TG = require('telegram-bot-api');

@Injectable()
export class TelegramClient {
  private logger : Logger = new Logger(TelegramClient.name)
  // private slimbot;
  private api;
  constructor(
    @Inject(TelegramConfig.KEY)
    private telegramConfig: ConfigType<typeof TelegramConfig>,
  ) {
    // this.slimbot = new Slimbot(telegramConfig.botToken);
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
    
    // return axios.get(
    //   `https://api.telegram.org/bot${this.telegramConfig.botToken}/sendMessage?chat_id=&text=${text}`,
    // );
  }
}
