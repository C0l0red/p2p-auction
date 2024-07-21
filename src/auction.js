export default class Auction {
    constructor(db) {
        this.db = db
    }

    async addMember(name) {
        let members = (await this.db.get("members"))?.value;
        if (!members) {
            members = [name];
        } else {
            members = JSON.parse(members);
            members.push(name);
        }
        await this.db.put('members', JSON.stringify(members));
    }

    async addItem(user, itemName, price) {
        const item = {itemName: itemName.toLowerCase(), owner: user.toLowerCase(), price, highestBidder: null};
        await this.db.put(`item:${itemName}`, JSON.stringify(item));

        return `Client#${user} opens auction: sell ${itemName} for ${price} USDt`;
    }

    async bidItem(user, itemName, price) {
        const item = await this.getItem(itemName.toLowerCase());
        if (user.toLowerCase() === item.owner) {
            throw new Error("You cannot bid for an item you auctioned");
        }
        if (price < item.price) {
            throw new Error(`Your bid is lower than the highest bid of ${item.price} USDt`);
        }

        item.price = price;
        item.highestBidder = user.toLowerCase();
        await this.db.put(`item:${itemName.toLowerCase()}`, JSON.stringify(item));

        return `client#${user} makes bid for client#${item.owner} -> ${itemName} with ${price} USDt`;
    }

    async sellItem(user, itemName) {
        const item = await this.getItem(itemName.toLowerCase());
        if (user.toLowerCase() !== item.owner) {
            throw new Error('You do not own this item');
        }
        await this.db.del(`item:${itemName.toLowerCase()}`);
        return `client#${item.owner} closes auction: sold ${itemName} to ${item.highestBidder} for ${item.price} USDt`;
    }

    async getItem(itemName) {
        let itemBuffer = (await this.db.get(`item:${itemName}`))?.value;
        if (!itemBuffer) {
            throw new Error('Item not found')
        }
        return JSON.parse(itemBuffer.toString());
    }
}