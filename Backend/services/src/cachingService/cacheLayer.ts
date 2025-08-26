import {createClient} from 'redis'
import {logError} from "../logger/loggerService.js";

/**
 * Core CacheLayer holder class following the Singleton pattern.
 *
 * - Stores a single Redis client instance.
 * - Enforces one-time initialization using `initialiseCache()`
 * - Use `getInstance()` to access the stored Redis client
 *
 * Designed to be extended or accessed by the Specific service class (e.g., redisClient, etc).
 */
class CacheLayer{
    private static cacheLayer: { [key: string]: unknown } = {}

    /**
     * Returns the initialized Redis client instance.
     * Throws an error if called before initialization.
     */
    public static getInstance(name: string){
        if(!CacheLayer.cacheLayer[name]){
            logError(`CacheLayer for ${name} not initialised please initialise using CacheLayer.initialiseDB() method`)
            throw new Error("CacheLayer not initialised please initialise using CacheLayer.initialiseDB() method");
        }
        return CacheLayer.cacheLayer[name]
    }

    /**
     * Initializes the cache client instance once.
     * Subsequent calls with a new client will throw an error.
     *
     * @param name
     * @param client - The Redis client instance to store
     */
    public static initialiseCache(name:string,client:unknown){
        if (CacheLayer.cacheLayer[name]) {
            logError("Cache already initialised")
            throw new Error("Cache already initialised");
        }
        if (!CacheLayer.cacheLayer[name] && client) {
            CacheLayer.cacheLayer[name] = client;
        }
    }
}

/**
 * Public Redis client accessor class.
 *
 * Ensures connection on retrieval and provides strongly typed Redis access.
 */
export class redisClient {
    /**
     * Connects and returns the Redis client instance.
     *
     * @returns {Promise<ReturnType<typeof createClient>>} Connected Redis client
     */
    public static async getInstance(name: string): Promise<ReturnType<typeof createClient>> {
        const client = CacheLayer.getInstance(name) as ReturnType<typeof createClient>;

        if (!client.isOpen) {
            await client.connect(); // only connect if not already connected
        }

        return client;
    }
}

const redis_cache = createClient({
    url: 'redis://redis-cache:6379'
});

const redis_pub = createClient({
    url: 'redis://redis-pub-sub:6379'
})

const redis_sub = createClient({
    url: 'redis://redis-pub-sub:6379'
})

CacheLayer.initialiseCache('cache',redis_cache)
CacheLayer.initialiseCache('pub',redis_pub)
CacheLayer.initialiseCache('sub',redis_sub)