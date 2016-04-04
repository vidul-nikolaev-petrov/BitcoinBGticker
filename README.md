# README #

### Supported Exchanges ###

* [Bitfinex](http://docs.bitfinex.com/#websocket) (WebSockets)
* [Bitstamp](https://www.bitstamp.net/websocket/) (WebSockets)
* [Coinbase](https://developers.coinbase.com/api/v2#prices) (Ajax)

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
        interval: 30000,
        url: 'https://api.exchange.coinbase.com/products/BTC-USD/ticker',
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