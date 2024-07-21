import readline from 'readline';
import Client from './client.js'

export class UserInterface {
    bidRegex = /bid\s+(?<itemName>\w+)\s+for\s+(?<price>\d+(\.\d{1,2})?)/i;
    auctionRegex = /auction\s+(?<itemName>\w+)\s+for\s+(?<price>\d+(\.\d{1,2})?)/i;
    sellRegex = /sell\s+(?<itemName>\w+)/i;

    constructor() {
        this.cli = new CLI();
    }

    async init() {
        this.name = await this.cli.ask("Enter your name > ");
        console.log(`Welcome, ${this.name}!`);
        console.log("This is an auction service and you can perform three actions");
        console.log("1. AUCTION -> You can auction an item with the format 'AUCTION <item-name> FOR <price>'");
        console.log("2. BID -> You can bid for an item with the format 'BID <item-name> FOR <price>'");
        console.log("3. SELL -> You can sell an item you auctioned for the price of the highest bid with the format 'SELL <item-name>'\n");

        this.client = new Client(this.name, process.argv[2]); // Pass the key as an argument
        await this.client.init();
    }

    async askForInput() {
        const input = await this.cli.ask("> ");
        await this.handleInput(input);
        await this.askForInput();
    }

    async handleInput(input) {
        if (this.auctionRegex.test(input)) {
            const match = input.match(this.auctionRegex);
            await this.client.makeAuctionRequest(match.groups.itemName, match.groups.price);
        } else if (this.bidRegex.test(input)) {
            const match = input.match(this.bidRegex);
            await this.client.makeBidRequest(match.groups.itemName, match.groups.price);
        } else if (this.sellRegex.test(input)) {
            const match = input.match(this.sellRegex);
            await this.client.makeSellRequest(match.groups.itemName);
        } else {
            console.log(`> \x1b[31m[ERROR]\x1b[0m`, "Invalid input!");
        }
    }
}


export class CLI {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
    }

    async ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (input) => resolve(input));
        });
    }
}

