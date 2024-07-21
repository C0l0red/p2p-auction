import RPC from '@hyperswarm/rpc';
import Hypercore from 'hypercore';
import Hyperbee from 'hyperbee';
import DHT from "hyperdht";
import Auction from './auction.js'
import crypto from 'crypto';


class Server {
    constructor(corePath, port) {
        this.port = port;
        this.core = new Hypercore(corePath);
        this.bee = new Hyperbee(this.core, {keyEncoding: 'utf-8', valueEncoding: 'binary'});
        this.auction = new Auction(this.bee);
    }

    async init() {
        await this.bee.ready();

        const dhtSeed = await this.getSeedOrCreate('dht-seed');
        this.dht = new DHT({
            port: this.port,
            keyPair: DHT.keyPair(dhtSeed),
            bootstrap: [{host: '127.0.0.1', port: 30001}] // The bootstrap node should be running
        });
        await this.dht.ready();

        const rpcSeed = await this.getSeedOrCreate('rpc-seed');

        this.rpc = new RPC({seed: rpcSeed, dht: this.dht});
    }

    async getSeedOrCreate(seedKey) {
        let seedValue = (await this.bee.get(seedKey))?.value
        if (!seedValue) {
            seedValue = crypto.randomBytes(32);
            await this.bee.put(seedKey, seedValue);
        }
        return seedValue;
    }

    async startListening() {
        this.rpcServer = this.rpc.createServer();
        await this.rpcServer.listen();
        console.log('rpc server started listening on public key:', this.rpcServer.publicKey.toString('hex'));

        this.rpcServer.respond('auction', this.handleAuctionItem.bind(this));
        this.rpcServer.respond('bid-item', this.handleBidItem.bind(this));
        this.rpcServer.respond('sell-item', this.handleSellItem.bind(this));
    }

    async handleAuctionItem(rawRequest, rpc) {
        const request = JSON.parse(rawRequest.toString('utf-8'));
        try {
            const message = await this.auction.addItem(request.user, request.itemName, request.price);
            this.broadcast(message);
        } catch (error) {
            const errorMessage = {error: error.message};
            this.sendMessage(errorMessage, rpc._mux.stream);
        }
    }

    async handleBidItem(rawRequest, rpc) {
        const request = JSON.parse(rawRequest.toString('utf-8'));
        try {
            const message = await this.auction.bidItem(request.user, request.itemName, request.price);
            this.broadcast(message);
        } catch (error) {
            const errorMessage = {error: error.message};
            this.sendMessage(errorMessage, rpc._mux.stream);
        }
    }

    async handleSellItem(rawRequest, rpc) {
        const request = JSON.parse(rawRequest.toString('utf-8'));

        try {
            const message = await this.auction.sellItem(request.user, request.itemName);
            this.broadcast(message);
        } catch (error) {
            const errorMessage = {error: error.message};
            this.sendMessage(errorMessage, rpc._mux.stream);
        }
    }

    broadcast(message) {
        const jsonMessage = {message};

        this.rpcServer.connections.forEach(rpc => {
            this.sendMessage(jsonMessage, rpc.stream);
        })
        console.log(message);
    }

    sendMessage(message, stream) {
        const messageBuffer = Buffer.from(JSON.stringify(message), 'utf-8');
        stream.write(messageBuffer);
    }
}

const server = new Server("./db/rpc-server", 40001);
await server.init();
server.startListening().catch(console.error);