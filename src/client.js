import RPC from '@hyperswarm/rpc';
import {CLI} from "./utils.js";
import DHT from "hyperdht";

class Client {
    constructor(user, serverPublicKey) {
        this.user = user;
        this.serverPublicKey = Buffer.from(serverPublicKey, 'hex');
    }

    async init() {
        this.dht = new DHT({
            bootstrap: [{host: '127.0.0.1', port: 30001}] // note boostrap points to dht that is started via cli
        });
        await this.dht.ready();

        this.rpc = new RPC({dht: this.dht});
        this.client = this.rpc.connect(this.serverPublicKey);
//        await this.joinAuction();
        this.client.stream.on("data", this.handleData);
    }

    async joinAuction() {
        const payload = {name: this.user};
        const rawPayload = Buffer.from(JSON.stringify(payload), 'hex');
        const rawResponse = await this.client.request('join', rawPayload);
        const response = JSON.parse(rawResponse.toString('utf-8'));

        this.id = response.id;
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

    async close() {
        // closing connection
        await this.rpc.destroy();
    }

    async handleData(data) {
        try {
            const jsonData = JSON.parse(data.toString('utf-8'));
            if (jsonData.message) {
                console.log(`\x1b[36m[SERVER]\x1b[0m`, jsonData.message);
                process.stdout.write('> ');
            }
        } catch (error) {

        }
    }
}

const cli = new CLI();
const name = await cli.ask("Enter your name> ");
console.log(`Welcome, ${name}!`);
console.log("This is an auction service and you can perform three actions");
console.log("1. AUCTION -> You can auction an item with the format 'AUCTION <item-name> FOR <price>'");
console.log("2. BID -> You can bid for an item with the format 'BID <item-name> FOR <price>'");
console.log("3. SELL -> You can sell an item you auctioned for the price of the highest bid with the format 'SELL <item-name>'\n");

const client = new Client(name, process.argv[2]);
await client.init();

async function guess() {
    const input = await cli.ask("> ");
    await handleInput(input);
    await guess();
}

guess();

const bidRegex = /bid\s+(?<itemName>\w+)\s+for\s+(?<price>\d+(\.\d{1,2})?)/i;
const auctionRegex = /auction\s+(?<itemName>\w+)\s+for\s+(?<price>\d+(\.\d{1,2})?)/i;
const sellRegex = /sell\s+(?<itemName>\w+)/i;

async function handleInput(input) {
    if (auctionRegex.test(input)) {
        const match = input.match(auctionRegex);
        await client.makeAuctionRequest(match.groups.itemName, match.groups.price);
    } else if (bidRegex.test(input)) {
        const match = input.match(bidRegex);
        await client.makeBidRequest(match.groups.itemName, match.groups.price);
    } else if (sellRegex.test(input)) {
        const match = input.match(sellRegex);
        await client.makeSellRequest(match.groups.itemName);
    }
}

