"use strict";
var apiData;
var chartData = [];
let myChart;
let submitBtn = document.getElementById("submit");
submitBtn.addEventListener("click", submitSearch);

let maxProfit = document.getElementById("maxProfit");
maxProfit.addEventListener("click", calcMaxProfit);

let weekSlider = document.getElementById("weekSlider");
weekSlider.addEventListener("change", buildChart);

function submitSearch(event) {
  event.preventDefault();
  var symbol = document.querySelector("#crypto").value.toUpperCase();

  // check if result is in local storage
  if (localStorage.getItem(symbol)) {
    apiData = JSON.parse(localStorage.getItem(symbol));
    console.info("Data from localstorage");
    buildChart();
    return;
  }
  // not in local? make request
  var apiRequest = new Request(
    `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_WEEKLY&symbol=${symbol}&market=USD&apikey=HPRS1K7BPTHM7CLU`
  );
  fetch(apiRequest)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      console.log("api return", data);
      apiData = data;
      localStorage.setItem(symbol, JSON.stringify(apiData));
      buildChart();
    })
    .catch(function (error) {
      alert("Coin not found, try a different ticker");
    });
}

// chart logic below
function buildChart() {
  let currencyName = apiData["Meta Data"]["3. Digital Currency Name"];
  // parse object into readable data for chart.js
  chartData = [];
  Object.keys(apiData["Time Series (Digital Currency Weekly)"]).forEach((key) =>
    chartData.push({
      date: key,
      price:
        apiData["Time Series (Digital Currency Weekly)"][key][
          "4a. close (USD)"
        ],
    })
  );
  // chronological order and trim.
  let weeksOfData = document.getElementById("weekSlider").value;
  chartData = chartData.reverse().slice(-weeksOfData);
  document.getElementById(
    "weeks"
  ).innerText = `Last ${chartData.length} weeks.`;

  const data = {
    datasets: [
      {
        label: currencyName,
        backgroundColor: "rgb(122, 161, 91)",
        borderColor: "rgb(122, 161, 91)",
        data: chartData,
      },
    ],
  };

  const config = {
    type: "line",
    data: data,
    options: {
      font: {
        size: 20,
      },
      scales: {
        x: {
          ticks: {
            color: "white",
            font: { size: 14 },
          },
        },
        y: {
          ticks: {
            color: "white",
            font: { size: 16 },
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "white",
            font: {
              size: 22,
            },
          },
        },
      },

      legend: {
        color: "white",
        labels: {
          color: "white",
          font: { defaultFontSize: 16 },
        },
      },
      parsing: {
        xAxisKey: "date",
        yAxisKey: "price",
      },
    },
  };

  if (myChart == undefined) {
    myChart = new Chart(document.getElementById("cryptoChart"), config);
    return;
  } else {
    myChart.destroy();
    myChart = new Chart(document.getElementById("cryptoChart"), config);
  }
  clearProfit();
}

function calcMaxProfit(e) {
  e.preventDefault();
  let answer = {};
  chartData.forEach((e) => (e.price = Number(e.price)));
  let prices = chartData;
  let profit = 0;
  let min = prices[0].price;
  answer.buyDate = prices[0].date;
  answer.buy = min;

  for (let i = 1; i < prices.length; ++i) {
    if (min > prices[i].price) {
      min = prices[i].price;
      // if (prices[i].date > answer?.sellDate) {
      //   continue;
      // }
      // answer.buyDate = prices[i].date;
      // answer.buy = min;
      // console.log(answer.buy);
    } else if (prices[i].price - min > profit) {
      profit = prices[i].price - min;
      answer.sellDate = prices[i].date;
      answer.sell = prices[i].price;
      answer.maxProfit = profit;
      // make function to find buydate & price based on proft
      findBuyDate(answer.sell, answer.maxProfit);
    }

    function findBuyDate(sellPrice, profit) {
      console.log(prices);
      let buyInfo = prices.filter(
        (e) => e.price === +(sellPrice - profit).toFixed(6)
      );
      answer.buyDate = buyInfo[0].date;
      answer.buy = buyInfo[0].price.toFixed(2);
    }
  }
  console.log(answer);
  // set text for max profit
  document.getElementById(
    "buy"
  ).innerHTML = `<td>Buy</td> <td>${answer.buyDate} </td><td>$${answer.buy}</td>`;
  document.getElementById("sell").innerHTML = `<td>Sell</td> <td>${
    answer.sellDate
  } </td><td>$${answer.sell.toFixed(2)}</td>`;
  document.getElementById("profit").innerHTML = `<th>Profit</th><th>${(
    (answer.maxProfit / answer.buy) *
    100
  ).toFixed(2)}% gain</th><th>$${answer.maxProfit.toFixed(2)}</th>`;
  console.log(answer);
  return;
}

function clearProfit() {
  document.getElementById("buy").innerText = "";
  document.getElementById("sell").innerText = "";
  document.getElementById("profit").innerText = "";
}

// on page load, load BTC
if (localStorage.getItem("BTC")) {
  apiData = JSON.parse(localStorage.getItem("BTC"));
  console.info("Data from localstorage");
  buildChart();
} else {
  fetch(
    new Request(
      `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_WEEKLY&symbol=BTC&market=USD&apikey=HPRS1K7BPTHM7CLU`
    )
  )
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      apiData = data;
      localStorage.setItem("BTC", JSON.stringify(apiData));
      buildChart();
    })
    .catch(function (error) {
      alert("API Having issues, try again later");
    });
}
