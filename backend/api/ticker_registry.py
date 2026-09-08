from api.schemas.market_models import TickerInfo

TICKER_REGISTRY: list[TickerInfo] = [
    TickerInfo(symbol="AAPL", name="Apple Inc.", asset_class="equity"),
    TickerInfo(symbol="MSFT", name="Microsoft Corp.", asset_class="equity"),
    TickerInfo(symbol="GOOGL", name="Alphabet Inc.", asset_class="equity"),
    TickerInfo(symbol="AMZN", name="Amazon.com Inc.", asset_class="equity"),
    TickerInfo(symbol="NVDA", name="NVIDIA Corp.", asset_class="equity"),
    TickerInfo(symbol="META", name="Meta Platforms Inc.", asset_class="equity"),
    TickerInfo(symbol="JPM", name="JPMorgan Chase & Co.", asset_class="equity"),
    TickerInfo(symbol="GS", name="Goldman Sachs Group", asset_class="equity"),
    TickerInfo(symbol="BAC", name="Bank of America Corp.", asset_class="equity"),
    TickerInfo(symbol="XOM", name="Exxon Mobil Corp.", asset_class="equity"),
    TickerInfo(symbol="JNJ", name="Johnson & Johnson", asset_class="equity"),
    TickerInfo(symbol="PG", name="Procter & Gamble Co.", asset_class="equity"),
    TickerInfo(symbol="KO", name="Coca-Cola Co.", asset_class="equity"),
    TickerInfo(symbol="TSLA", name="Tesla Inc.", asset_class="equity"),
    TickerInfo(symbol="V", name="Visa Inc.", asset_class="equity"),
    TickerInfo(symbol="GLD", name="SPDR Gold Trust", asset_class="commodity"),
    TickerInfo(symbol="BND", name="Vanguard Total Bond Market ETF", asset_class="bond"),
    TickerInfo(symbol="QQQ", name="Invesco QQQ Trust", asset_class="equity"),
    TickerInfo(symbol="SPY", name="SPDR S&P 500 ETF Trust", asset_class="equity"),
    TickerInfo(
        symbol="VTI", name="Vanguard Total Stock Market ETF", asset_class="equity"
    ),
    TickerInfo(symbol="DJI", name="Dow Jones Industrial Average", asset_class="equity"),
    TickerInfo(symbol="BTC-USD", name="Bitcoin", asset_class="crypto"),
    TickerInfo(symbol="EURUSD=X", name="EUR/USD", asset_class="fx"),
    TickerInfo(symbol="GBPUSD=X", name="GBP/USD", asset_class="fx"),
    TickerInfo(symbol="USDJPY=X", name="USD/JPY", asset_class="fx"),
    TickerInfo(symbol="USDCHF=X", name="USD/CHF", asset_class="fx"),
    TickerInfo(symbol="EURGBP=X", name="EUR/GBP", asset_class="fx"),
]
