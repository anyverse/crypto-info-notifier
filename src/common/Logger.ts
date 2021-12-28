import dotenv from 'dotenv';
import { resolve } from 'path';
import winston, { format } from 'winston';
import 'winston-daily-rotate-file';

dotenv.config({ path: resolve('env', `.${process.env.ENV}.env`) });

const printf = format.printf(({ context, message, level, timestamp, requestId }) => {
  return `${timestamp} ${level} [${context}]${requestId ? `[${requestId}]` : ''}: ${message}`;
});

const timeFormat = 'YYYY-MM-DD HH:mm:ss';

const getTransports: () => Record<string, winston.transport> = () => ({
  console: (() => {
    const formats = [format.errors({ stack: true }), format.timestamp({ format: timeFormat }), printf].filter(
      (f) => !!f,
    );
    if (process.env.APP_LOG_CONSOLE_COLOR == 'true') {
      formats.push(
        format.colorize({
          all: true,
        }),
      );
    }
    return new winston.transports.Console({
      format: format.combine(...formats),
    });
  })(),
  rotateFile: new winston.transports.DailyRotateFile({
    format: format.combine(format.errors({ stack: true }), format.timestamp({ format: timeFormat }), printf),
    dirname: resolve('logs'),
    filename: `${process.env.APP_LOG_FILE_NAME}.%DATE%.log`,
  }),
});

export class Logger {
  private logger?;

  constructor(context: string) {
    const transports = getTransports();
    const trans = process.env.APP_LOG_TRANSPORTS
      ? process.env.APP_LOG_TRANSPORTS.split(',')
          .map((transport) => transports[transport])
          .filter((t) => !!t)
      : [];
    if (trans.length > 0) {
      this.logger = winston.createLogger({
        level: process.env.APP_LOG_LEVEL,
        defaultMeta: { context },
        transports: trans,
      });
    }
  }

  setRequestId(requestId: string) {
    if (this.logger) {
      this.logger.defaultMeta = { requestId, ...this.logger.defaultMeta };
    }
  }

  log(msg: any) {
    this.info(msg);
  }

  debug(msg: any) {
    if (this.logger) {
      this.logger.debug(msg);
    }
  }

  info(msg: any) {
    if (this.logger) {
      this.logger.info(msg);
    }
  }

  warn(msg: any) {
    if (this.logger) {
      this.logger.warn(msg);
    }
  }

  error(msg: any, error?: any) {
    if (this.logger) {
      this.logger.error(msg);
      this.logger.error(error);
    }
  }
}
