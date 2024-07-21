# P2P Auction

## THIS IS A FEATURE BRANCH I CREATED AFTER THE ASSESSMENT TO REFACTOR SOME THINGS AND COMPLETE THE APPLICATION AFTER SOME MORE READING.

## FOR THE INTIAL SUBMISSION, CHECKOUT TO THE MASTER BRANCH.

I built this simple P2P application using `hypercore`, `hyperswarm/rpc` and `hyperbee`.

The application uses OOP to define types such as `Server`, `Client`, `UserInterface`, `CLI` and `Auction`.
This branch is the complete solution, favoring class package defined class properties over user defined ones, adding more robust error handling and propagation.\
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
