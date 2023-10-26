/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import pino, {type Logger as PinoLogger} from 'pino'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'; 

export interface LoggerConfiguration {
    defaultLogLevel: LogLevel,
    stdout?:boolean,
    file?: {
        debug?:{destination:string},
        info?:{destination:string},
        warn?:{destination:string},
        error?:{destination:string}
    }
}

export interface ILogger {
    debug(...data: unknown[]): void;
    info(...data: unknown[]): void;
    warn(...data: unknown[]): void;
    error(err: Error, info: object | string): void;
    child(context: object): ILogger;
}


export function getPinoTransports(config:LoggerConfiguration) {
    const pinoPretty = config.stdout ?? true ? [{
        level: config.defaultLogLevel ?? 'info',
        target: 'pino-pretty',
        options: {
        }
      }] : [];

    const fileHandlers = Object.entries(config.file ?? {}).map(([logLevel, config]) => ({
        level: logLevel,
          target: 'pino/file',
          options: { destination: config.destination }
    }))
    return [...pinoPretty, ...fileHandlers]
}

export class DefaultLogger implements ILogger {
    private logger: PinoLogger;
    private config:LoggerConfiguration;

    children: Map<string, ILogger> = new Map();

    constructor(config:LoggerConfiguration) {
        this.config = config
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const transport = pino.transport({
            targets: getPinoTransports(config),
            worker: {
                autoEnd: true
            },
            dedupe:true,
          });
         
        const logger = pino(transport);
      
          this.logger = logger;
          process.on("exit", () => {
            transport.end();
          })

    }

    child(context:object): ILogger {
        const contextString = JSON.stringify(context);
        if (this.children.has(contextString)) {
            return this.children.get(contextString) as ILogger
        }
        const childLogger = new DefaultLogger(this.config);
        childLogger.logger = this.logger.child(context)
        this.children.set(contextString, childLogger)
        return childLogger
    }

    debug(msg: string, ...args: object[]): void {
        this.logger.debug(msg, ...args)
    }
    info(msg: string, ...args: object[]): void {
        this.logger.info(msg, ...args)
    }
    warn(msg: string, ...args: object[]): void {
        this.logger.warn(msg, ...args);
    }
    error(err: Error, info: object | string): void {
        this.logger.error({err, info});
    }
}
