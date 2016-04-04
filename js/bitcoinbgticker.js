window.onload = function () {
    (function () {
        var settings = {
                currency: {
                    interval: 3600 * 1000, // per hour 
                    url: 'http://api.fixer.io/latest?base=USD',
                },
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
                },
                events: {
                    bitfinex: 'price_update_bitfinex',
                    bitstamp: 'price_update_bitstamp',
                    coinbase: 'price_update_coinbase',
                },
                html: {
                    placeholder: {
                        odometer: document.getElementById('odometer'),
                        usd2bgn: document.getElementById('usd2bgn'),
                    },
                },
                odometer: {
                    auto: false,
                    format: '( , ddd).dd',
                    duration: 2048,
                },
            },
            ticker = new BitcoinBGTicker(settings);


        ticker.init();


        function BitcoinBGTicker(settings) {
            var self = this;

            self.currency = {};
            self.settings = settings;
            self.price = 0;
            self.prices = {};

            self.init = function () {
                createPriceEvents();
                getCurrencyExchangeRate();
                initBitfinex();
                initBitstamp();
                initCoinbase();
            };

            self.emitPriceEvent = function (event) {
                document.dispatchEvent(event);
            };

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

                    requirements &= !isNaN(self.price)
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
                        self.settings.html.placeholder.odometer.innerHTML = self.price;
                        self.settings.html.placeholder.usd2bgn.innerHTML =
                            (self.price * self.currency.bgn).toFixed(2);
                    });
                }
            };

            function initBitfinex() {
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

            function initBitstamp() {
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

            function initCoinbase() {
                var event = self.events.coinbase,
                    settings = self.settings.exchange.coinbase;

                setTimeout(startPolling, 4096);
                setInterval(startPolling, settings.interval);

                function startPolling() {
                    ajax(settings.url, function (response) {
                        _initPrice_(event, JSON.parse(response).price);
                    });
                }
            }

            function _initPrice_(event, price) {
                self.price = +price;
                self.emitPriceEvent(event);
            }

            function getCurrencyExchangeRate() {

                setTimeout(startPolling);
                setInterval(startPolling, self.settings.currency.interval);

                function startPolling() {
                    ajax(self.settings.currency.url, function (response) {
                        var data = JSON.parse(response);

                        Object.keys(data.rates).forEach(function(e){
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

                xmlhttp.open('GET', url, true);
                xmlhttp.send();
            }
        }
    })();
};