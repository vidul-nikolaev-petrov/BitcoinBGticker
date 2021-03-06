window.onload = function () {
    (function () {
        var settings = {
            currency: {
                interval: 3600 * 1000, // per hour 
                url: 'http://api.fixer.io/latest?base=USD',
            },
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
            },
            events: {
                btc_e: 'price_update_btc_e',
                bitfinex: 'price_update_bitfinex',
                bitstamp: 'price_update_bitstamp',
                coinbase: 'price_update_coinbase',
                kraken: 'price_update_kraken',
            },
            html: {
                placeholder: {
                    odoticker: document.getElementById('odoticker'),
                    bgnticker: document.getElementById('bgnticker'),
                },
            },
            odometer: {
                auto: false,
                format: '( , ddd).dd',
                duration: 2048,
            },
        };

        new BitcoinBGTicker(settings).init();


        function BitcoinBGTicker(settings) {
            var self = this;

            self.currency = {};
            self.price = 0;
            self.prices = {};
            self.settings = settings;

            self.init = function () {
                browsersPolyfills();
                createPriceEvents();
                getCurrencyExchangeRate();
                initExchanges();
            };

            self.emitPriceEvent = function (event) {
                document.dispatchEvent(event);
            };

            function initExchanges() {
                Object.keys(self.settings.exchange).forEach(function (e) {
                    var exchange = self.settings.exchange[e],
                        init_function = 'init' + exchange.name;

                    if (exchange.disabled) return;

                    self[init_function]();
                });
            }

            function createPriceEvents() {
                self.events = {};

                Object.keys(self.settings.events).forEach(function (e) {
                    self.events[e] = new CustomEvent(e, {
                        detail: self.settings.events[e],
                    });
                })

                Object.keys(self.events).forEach(function (e) {
                    self.prices[self.events[e].type] = null;
                });

                self.handlePriceEvent();
            }

            self.handlePriceEvent = function () {
                Object.keys(self.events).forEach(function (e) {
                    var event = self.events[e];

                    document.addEventListener(event.type,
                        function () {
                            handlePriceEvent(event.type);
                        });
                });

                function handlePriceEvent(event_type) {
                    var price = 0,
                        exchanges = 0,
                        requirements = true;

                    requirements &= !isNaN(self.price);
                    requirements &= self.prices[event_type] !== self.price;

                    if (!requirements) return;

                    self.prices[event_type] = self.price;

                    console.log('event_type:', event_type, self.prices); //remove in prod

                    Object.keys(self.prices).forEach(function (e) {
                        if (self.prices[e]) {
                            price += self.prices[e];
                            exchanges++;
                        }
                    });

                    self.price = (price / exchanges).toFixed(2);

                    if (handlePriceEvent.timeout) {
                        clearTimeout(handlePriceEvent.timeout);
                    }

                    handlePriceEvent.timeout = setTimeout(function () {
                        self.settings.html.placeholder.odoticker.innerHTML = self.price;
                        self.settings.html.placeholder.bgnticker.innerHTML =
                            (self.price * self.currency.bgn).toFixed(2);
                    });
                }
            };

            self.initBitfinex = function () {
                var event = self.events.bitfinex,
                    settings = self.settings.exchange.bitfinex,
                    ws = new WebSocket(settings.url);

                ws.onopen = function () {
                    ws.send(JSON.stringify(settings.request));
                };

                ws.onmessage = function (response) {
                    var data = JSON.parse(response.data);

                    initPrice(data);
                };

                function initPrice(data) {
                    if (data.length === 11) {
                        _initPrice_(event, data[1]);
                    }
                }
            }

            self.initBitstamp = function () {
                var event = self.events.bitstamp,
                    settings = self.settings.exchange.bitstamp.pusher,
                    pusher = new Pusher(settings.key),
                    trades_channel = pusher.subscribe(settings.channel);

                trades_channel.bind(settings.event,
                    function (data) {
                        initPrice(data);
                    });

                function initPrice(data) {
                    _initPrice_(event, data.price);
                }
            }

            self.initBTC_E = function () {
                var event = self.events.btc_e,
                    settings = self.settings.exchange.btc_e;

                setTimeout(startPolling, settings.start_after);
                setInterval(startPolling, settings.interval);

                function startPolling() {
                    ajax(settings.url, function (response) {
                        var data = JSON.parse(response).query.results;

                        _initPrice_(event, data.btc_usd.avg);
                    });
                }
            }

            self.initCoinbase = function () {
                var event = self.events.coinbase,
                    settings = self.settings.exchange.coinbase;

                setTimeout(startPolling, settings.start_after);
                setInterval(startPolling, settings.interval);

                function startPolling() {
                    ajax(settings.url, function (response) {
                        var data = JSON.parse(response).query.results.json;

                        _initPrice_(event, data.price);
                    });
                }
            }

            self.initKraken = function () {
                var event = self.events.kraken,
                    settings = self.settings.exchange.kraken;

                setTimeout(startPolling, settings.start_after);
                setInterval(startPolling, settings.interval);

                function startPolling() {
                    ajax(settings.url, function (response) {
                        var data = JSON.parse(response).query.results.json;

                        _initPrice_(event, data.result.XXBTZUSD.c[0]);
                    });
                }
            }

            function _initPrice_(event, price) {
                self.price = +price;
                self.emitPriceEvent(event);
            }

            function getCurrencyExchangeRate() {

                startPolling();

                setInterval(startPolling, self.settings.currency.interval);

                function startPolling() {
                    ajax(self.settings.currency.url, function (response) {
                        var data = JSON.parse(response).query.results.json;

                        Object.keys(data.rates).forEach(function (e) {
                            self.currency[e.toLowerCase()] = data.rates[e];
                        });
                    });
                }
            }

            function ajax(url, callback) {
                var xmlhttp = new XMLHttpRequest();

                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        callback(xmlhttp.responseText);
                    }
                }

                xmlhttp.open('GET', formatURL(url), true);
                xmlhttp.send();

                function formatURL(url) {
                    var url_yahoo = 'http://query.yahooapis.com/v1/public/yql?' +
                        'q=select * from json where url ="' + url + '"&format=json';

                    return url_yahoo;
                }
            }
        }

        // IE miseries
        function browsersPolyfills() {
            polyfillEventIE();

            function polyfillEventIE() {
                if (typeof window.CustomEvent === 'function') return false;

                function CustomEvent(event, params) {
                    params = params || {
                        bubbles: false,
                        cancelable: false,
                        detail: undefined,
                    };

                    var evt = document.createEvent('CustomEvent');

                    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

                    return evt;
                }

                CustomEvent.prototype = window.Event.prototype;

                window.CustomEvent = CustomEvent;
            }
        }
    })();
};
