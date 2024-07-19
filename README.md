# P2P Auction

I built this simple P2P application using `hyperbee`, `hyperswarm/rpc` and `hyperbee`.

The application uses OOP to define types such as `Server`, `Client`, `CLI` and `Auction`.
Most of it is complete, save for the error handling when users enter invalid commands.\
The items for bid are persisted using HyperBee.

I hope you find it interesting.

I also added some typings for the classes as I initially wanted to do this in Typescript.
The repository for types is [here](https://github.com/C0l0red/hyper-types)
I wanted to know if I could get permission to contribute to the projects for Typescript support as I found it
interesting while preparing for this assessment.

I'd love to hear back from you.

## How to Run

- Install all packages with `npm inastll`
- Install hyperdht globally with `npm install -g hyperdht`
- Start the bootstrap node with `hyperdht --bootstrap --host 127.0.0.1 --port 30001` or any port of your choice
- Start the server with `node src/server.js`
- Copy the key in the terminal
- Start any number of clients with `node src/client.js <public-key>`
- There is a (somewhat) interactive CLI telling you how to take actions
