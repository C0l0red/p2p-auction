import readline from 'readline';

let rl;

export class CLI {
    constructor() {
    }

    async ask(question) {
        if (!rl) {
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
        }
        return new Promise((resolve) => {
            rl.question(question, (input) => resolve(input));
        });
    }
}