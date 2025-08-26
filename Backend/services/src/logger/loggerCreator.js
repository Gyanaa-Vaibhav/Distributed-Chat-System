import winston from "winston";
import * as url from "node:url";
import * as fs from 'node:fs';
import * as path from "node:path";
const { combine, timestamp, colorize, align, printf, errors } = winston.format;
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logPath = path.join(__dirname, '..', '..', '..', '..', 'logs');
let pathExists = false;
if (!pathExists && !fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
    pathExists = true;
    console.log("Logs folder not found creating a new one");
}
var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel["ERROR"] = "error";
    LoggerLevel["WARN"] = "warn";
    LoggerLevel["INFO"] = "info";
    LoggerLevel["HTTP"] = "http";
    LoggerLevel["VERBOSE"] = "verbose";
    LoggerLevel["DEBUG"] = "debug";
    LoggerLevel["SILLY"] = "silly";
})(LoggerLevel || (LoggerLevel = {}));
const format = combine(colorize({ all: true }), errors({ stack: true }), timestamp({
    format: 'YYYY-MM-DD hh:mm:ss.SSS A',
}), align(), printf((info) => {
    return info.stack
        ? `\n[${info.timestamp}] ${info.level}: ${info.message}${info.stack ? `\nStack Trace - ${info.stack}` : ''}`
        : `[${info.timestamp}] ${info.level}: ${info.message}`;
}));
// TODO need to add Daily File exports manually to all the loggers
const transports = [new winston.transports.Console({
        level: LoggerLevel.SILLY,
    })];
const createLogger = (level) => {
    return winston.createLogger({
        level,
        format,
        transports
    });
};
/**
 * LoggerCreator class provides separate Winston loggers for each log level.
 * Each logger can be accessed independently to log messages of that level.
 *
 * Levels supported:
 * - error
 * - warn
 * - info
 * - http
 * - verbose
 * - debug
 * - silly
 */
export class LoggerCreator {
    errorLogger = createLogger(LoggerLevel.ERROR);
    warnLogger = createLogger(LoggerLevel.WARN);
    infoLogger = createLogger(LoggerLevel.INFO);
    httpLogger = createLogger(LoggerLevel.HTTP);
    verboseLogger = createLogger(LoggerLevel.VERBOSE);
    debugLogger = createLogger(LoggerLevel.DEBUG);
    sillyLogger = createLogger(LoggerLevel.SILLY);
    /**
     * Returns the Winston logger configured for 'error' level logs.
     */
    getErrorLogger() {
        return this.errorLogger;
    }
    /**
     * Returns the Winston logger configured for 'warn' level logs.
     */
    getWarnLogger() {
        return this.warnLogger;
    }
    /**
     * Returns the Winston logger configured for 'info' level logs.
     */
    getInfoLogger() {
        return this.infoLogger;
    }
    /**
     * Returns the Winston logger configured for 'http' level logs.
     */
    getHttpLogger() {
        return this.httpLogger;
    }
    /**
     * Returns the Winston logger configured for 'verbose' level logs.
     */
    getVerboseLogger() {
        return this.verboseLogger;
    }
    /**
     * Returns the Winston logger configured for 'debug' level logs.
     */
    getDebugLogger() {
        return this.debugLogger;
    }
    /**
     * Returns the Winston logger configured for 'silly' level logs.
     */
    getSillyLogger() {
        return this.sillyLogger;
    }
}
