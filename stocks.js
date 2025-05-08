document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('stocks.html')) {
        const stockTickerInput = document.getElementById('stock-ticker');
        const daysSelect = document.getElementById('days');
        const lookupStockButton = document.getElementById('lookup-stock');
        const stockChartCanvas = document.getElementById('stockChart');
        const redditTableBody = document.querySelector('#reddit-table tbody');
        let stockChart;

        function fetchStockData(ticker, days) {
            const apiKey = 'iyQdHg5FNAEtAPtitC0aLyW6nn44EUaR';
            const endDate = new Date().toISOString().slice(0, 10);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(days));
            const startDateFormatted = startDate.toISOString().slice(0, 10);

            const apiUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker.toUpperCase()}/range/1/day/${startDateFormatted}/${endDate}?adjusted=true&sort=asc&limit=500&apiKey=${apiKey}`;

            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`API Error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        const labels = data.results.map(item =>
                            new Date(item.t).toLocaleDateString());
                        const prices = data.results.map(item => item.c);

                        if (stockChart) {
                            stockChart.destroy();
                        }

                        stockChart = new Chart(stockChartCanvas, {
                            type: 'line',
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: `${ticker.toUpperCase()} Closing Price`,
                                    data: prices,
                                    borderColor: 'rgba(75, 192, 192, 1)',
                                    borderWidth: 2,
                                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                                    fill: false
                                }]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                        title: {
                                            display: true,
                                            text: 'Price ($)'
                                        }
                                    },
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Date'
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        throw new Error(`No data found for ${ticker.toUpperCase()}`);
                    }
                })
                .catch(error => {
                    console.error('Error fetching stock data:', error);
                    alert(`Error: ${error.message}`);
                });
        }

        // Stock lookup with validation
        if (lookupStockButton) {
            lookupStockButton.addEventListener('click', () => {
                const ticker = stockTickerInput.value.trim();
                const days = daysSelect.value;
                if (ticker) {
                    lookupStockButton.disabled = true;
                    lookupStockButton.textContent = 'Loading...';
                    fetchStockData(ticker, days);
                    setTimeout(() => {
                        lookupStockButton.disabled = false;
                        lookupStockButton.textContent = 'Lookup Stock';
                    }, 2000);
                } else {
                    alert('Please enter a stock ticker.');
                }
            });
        }

        // Function to fetch and display Reddit stocks
        async function fetchRedditStocks() {
            try {
                const res = await fetch("https://tradestie.com/api/v1/apps/reddit?date=2022-04-03");
                const data = await res.json();
                redditTableBody.innerHTML = ''; // Clear existing table rows

                data.slice(0, 5).forEach(stock => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><a href="https://finance.yahoo.com/quote/${stock.ticker}" target="_blank">${stock.ticker}</a></td>
                        <td>${stock.no_of_comments}</td>
                        <td>${stock.sentiment || 'N/A'} ${stock.sentiment === 'Bullish' ? '🐂' : (stock.sentiment === 'Bearish' ? '🐻' : '')}</td>`;
                    redditTableBody.appendChild(row);
                });
            } catch (err) {
                console.error("Reddit stocks fetch failed:", err);
                redditTableBody.innerHTML = '<tr><td colspan="3">Failed to load Reddit stocks.</td></tr>';
            }
        }

        // Initialize Annyang with proper error handling
        function initAnnyang() {
            if (typeof annyang !== 'undefined') {
                const commands = {
                    'lookup *stock': function(stock) {
                        stockTickerInput.value = stock.toUpperCase();
                        daysSelect.value = '30'; // Default to 30 days
                        lookupStockButton.click();
                    },
                    'hello': function() {
                        alert('Hello! Try saying "Lookup AAPL"');
                    },
                    'navigate to home': function() {
                        window.location.href = 'index2.html';
                    },
                    'navigate to dogs': function() {
                        window.location.href = 'dogs.html';
                    }
                };

                annyang.addCommands(commands);

                // Handle audio control buttons
                document.getElementById('turn-on-audio')?.addEventListener('click', () => {
                    try {
                        annyang.start();
                        alert('Voice commands enabled. Try saying "Lookup AAPL"');
                    } catch (e) {
                        alert('Error enabling voice commands: ' + e.message);
                    }
                });

                document.getElementById('turn-off-audio')?.addEventListener('click', () => {
                    annyang.abort();
                    alert('Voice commands disabled');
                });

                // Start initially (you might want to control this with a button)
                // annyang.start();
            } else {
                console.warn('Annyang not available');
            }
        }

        // Initialize everything
        fetchRedditStocks();
        initAnnyang();
    }
});



































































