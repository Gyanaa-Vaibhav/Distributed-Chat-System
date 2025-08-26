import {createClient} from 'redis'
import { redisClient } from "../cacheLayer.js";
import { logError } from "../../logger/loggerExport.js";

type RedisClientType = ReturnType<typeof createClient>;
type MessageHandler = (message: string, channel: string) => void;

const client_pub = await redisClient.getInstance('pub');
const client_sub = await redisClient.getInstance('sub');

export class PubSubService {
    private pubClient: RedisClientType | null = null;
    private subClient: RedisClientType | null = null;

    constructor() {}

    public async init(): Promise<void> {
        this.pubClient = await redisClient.getInstance('pub');
        this.subClient = await redisClient.getInstance('sub');
    }

    public async publish(channel: string, message: string): Promise<number> {
        if (!this.pubClient) await this.init();
        return await this.pubClient!.publish(channel, message);
    }

    public async subscribe(channel: string, handler: MessageHandler): Promise<void> {
        if (!this.subClient) await this.init();

        await this.subClient!.subscribe(channel, (message) => {
            try {
                handler(message, channel);
            } catch (err) {
                logError(`Error handling message on channel ${channel}: ${err}`);
            }
        });
    }

    public async unsubscribe(channel: string): Promise<void> {
        if (!this.subClient) return;
        await this.subClient.unsubscribe(channel);
    }
}

export const pubSub = new PubSubService();
await pubSub.init()

await pubSub.subscribe('notifications', (message, channel) => {
    console.log(`Message received on ${channel}:`, message);
});

// Publish a message
await pubSub.publish('notifications', 'Hello from publisher!');
