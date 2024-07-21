import RPC from '@hyperswarm/rpc';
import {UserInterface} from "./interfaces.js";
import DHT from "hyperdht";

export default  class Client {
    constructor(user, serverPublicKey) {
        this.user = user;
        this.serverPublicKey = Buffer.from(serverPublicKey, 'hex');
    }

    async init() {
        this.dht = new DHT({
            bootstrap: [{host: '127.0.0.1', port: 30001}] // Bootstrap server should be running
        });
        await this.dht.ready();

        this.rpc = new RPC({dht: this.dht});
        this.client = this.rpc.connect(this.serverPublicKey);
        this.client.stream.on("data", this.handleData);
    }

    async makeAuctionRequest(itemName, price) {
        const payload = {user: this.user, itemName, price};
        const rawPayload = Buffer.from(JSON.stringify(payload), 'utf-8');
        await this.client.event('auction', rawPayload);
    }

    async makeBidRequest(itemName, price) {
        const payload = {user: this.user, itemName, price};
        const rawPayload = Buffer.from(JSON.stringify(payload), 'utf-8');
        await this.client.event('bid-item', rawPayload);
    }

    async makeSellRequest(itemName) {
        const payload = {user: this.user, itemName};
        const rawPayload = Buffer.from(JSON.stringify(payload), 'utf-8');
        await this.client.event('sell-item', rawPayload);
    }

    async handleData(data) {
        try {
            const jsonData = JSON.parse(data.toString('utf-8'));
            if (jsonData.message) {
                console.log(`\x1b[36m[SERVER]\x1b[0m`, jsonData.message);
                process.stdout.write('> ');
            }
            if (jsonData.error) {
                console.log(`\x1b[31m[ERROR]\x1b[0m`, jsonData.error);
                process.stdout.write('> ');
            }
        } catch (error) {

        }
    }
}

const userInterface = new UserInterface();
await userInterface.init();
userInterface.askForInput();