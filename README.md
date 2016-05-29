# README #

### Supported exchanges ###

* [Bitfinex](http://docs.bitfinex.com/#websocket) (WebSockets)
* [Bitstamp](https://www.bitstamp.net/websocket/) (WebSockets)
* [BTC-E](https://btc-e.com/api/3/docs) (Ajax) (removed)
* [Coinbase](https://developers.coinbase.com/api/v2#prices) (Ajax)
* [Kraken](https://api.kraken.com/0/public/Ticker?pair=XXBTZUSD) (Ajax)

```
#!javascript
// exchanges' details
exchange: {
    bitfinex: {
        disabled: false,
        name: 'Bitfinex',
        request: {
            channel: 'ticker',
            event: 'subscribe',
            pair: 'BTCUSD',
        },
        url: 'wss://api2.bitfinex.com:3000/ws',
    },
    bitstamp: {
        disabled: false,
        name: 'Bitstamp',
        pusher: {
            key: 'de504dc5763aeef9ff52',
            channel: 'live_trades',
            event: 'trade',
        },
    },
    btc_e: {
        disabled: true,
        name: 'BTC_E',
        interval: 30000, // 30 seconds
        start_after: 0004, // immediately
        url: 'https://btc-e.com/api/3/ticker/btc_usd',
    },
    coinbase: {
        disabled: false,
        name: 'Coinbase',
        interval: 30000, // 30 seconds
        start_after: 0004, // immediately
        url: 'https://api.exchange.coinbase.com/products/BTC-USD/ticker',
    },
    kraken: {
        disabled: false,
        name: 'Kraken',
        interval: 30000, // 30 seconds
        start_after: 0004, // immediately
        url: 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD',
    },
};
```

### Currency API ###

* [Fixer.io](http://fixer.io)

```
#!javascript
currency: {
    interval: 3600 * 1000, // updated each hour
    url: 'http://api.fixer.io/latest?base=USD',
};
```

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### License ###

See the [LICENSE](LICENSE.txt) file for license rights and limitations (MIT).