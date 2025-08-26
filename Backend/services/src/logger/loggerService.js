import { LoggerCreator } from './loggerCreator.js';
const loggerCreator = new LoggerCreator();
/**
 * Logs a message using the error level logger.
 * @param message - The message or error object to log.
 */
export function logError(message) {
    loggerCreator.getErrorLogger().error(message);
}
/**
 * Logs a message using the warn level logger.
 * @param message - The message or error object to log.
 */
export function logWarn(message) {
    loggerCreator.getWarnLogger().warn(message);
}
/**
 * Logs a message using the info level logger.
 * @param message - The message or error object to log.
 */
export function logInfo(message) {
    loggerCreator.getInfoLogger().info(message);
}
/**
 * Logs a message using the http level logger.
 * @param message - The message or error object to log.
 */
export function logHttp(message) {
    loggerCreator.getHttpLogger().http(message);
}
/**
 * Logs a message using the verbose level logger.
 * @param message - The message or error object to log.
 */
export function logVerbose(message) {
    loggerCreator.getVerboseLogger().verbose(message);
}
/**
 * Logs a message using the debug level logger.
 * @param message - The message or error object to log.
 */
export function logDebug(message) {
    loggerCreator.getDebugLogger().debug(message);
}
/**
 * Logs a message using the silly level logger.
 * @param message - The message or error object to log.
 */
export function logSilly(message) {
    loggerCreator.getSillyLogger().silly(message);
}
// logError("Error")
// logInfo("Info")
// logWarn("Warn")
// logHttp("HTTP")
// logVerbose("Verbose")
// logDebug("Debug")
// logSilly("Silly")
// logError(new Error("Test Error"))
// logError(new Error("Test Error"))
