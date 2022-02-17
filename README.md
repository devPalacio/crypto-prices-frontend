# crypto-prices-frontend

## deployed [here](https://devpalacio.github.io/crypto-prices-frontend/)

### Hindsight crypto uses AlphaVantage api to implement the 'best time to buy a stock' dynamic programming algorithm.

#### Flow:
- BTC loads by default with 52 week window.
- User enters crypto ticker hits submit.
- If ticker is in localstorage, apiData variable is updated, if not, api request is made
- apiData is transformed to be easily parsed by Chart.js and displayed
- If you want to feel FOMO, click 'max profit' and data from algorithm will populate.
