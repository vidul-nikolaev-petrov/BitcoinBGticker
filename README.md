# README #

### Supported Exchanges ###

* Bitfinex (WebSockets)
* Bitstamp (WebSockets)
* Coinbase (Ajax)

```
#!javascript
// exchanges' details
exchange: {
    bitfinex: {
        request: {
            channel: 'ticker',
            event: 'subscribe',
            pair: 'BTCUSD',
        },
        url: 'wss://api2.bitfinex.com:3000/ws',
    },
    bitstamp: {
        pusher: {
            key: 'de504dc5763aeef9ff52',
            channel: 'live_trades',
            event: 'trade',
        },
    },
    coinbase: {
        url: 'https://api.exchange.coinbase.com/products/BTC-USD/ticker',
        interval: 10000,
    },
};
```

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact