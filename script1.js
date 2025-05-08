document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.tagName !== 'A') {
                e.preventDefault();
                const page = this.dataset.page || this.textContent.trim().toLowerCase();
                window.location.href = `${page === 'home' ? 'index2' : page}.html`;
            }
        });
    });

    // --- Home Page Functionality ---
    if (document.getElementById('quote-container')) {
        async function fetchQuote() {
            try {
                const response = await fetch('https://zenquotes.io/api/random');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data && data.length > 0) {
                    document.getElementById('quote-text').textContent = data[0].q;
                    document.getElementById('quote-author').textContent = `- ${data[0].a}`;
                } else {
                    document.getElementById('quote-text').textContent = "Failed to load quote.";
                    document.getElementById('quote-author').textContent = "";
                }
            } catch (error) {
                console.error('Quote fetch error:', error);
                document.getElementById('quote-text').textContent = "Failed to load quote.";
                document.getElementById('quote-author').textContent = "";
            }
        }

        fetchQuote();

        // Button Navigation (moved here to ensure buttons exist)
        const stocksButton = document.getElementById('stocks-button');
        if (stocksButton) {
            stocksButton.addEventListener('click', () => {
                window.location.href = 'stocks.html';
            });
        }

        const dogsButton = document.getElementById('dogs-button');
        if (dogsButton) {
            dogsButton.addEventListener('click', () => {
                window.location.href = 'dogs.html';
            });
        }
    }

    // --- Global Annyang Commands ---
    if (typeof annyang !== 'undefined') {
        const commands = {
            'hello': () => {
                alert('Hello World!');
            },
            'change the color to *color': (color) => {
                document.body.style.backgroundColor = color;
            },
            'navigate to stocks': () => {
                window.location.href = 'stocks.html';
            },
            'navigate to dogs': () => {
                window.location.href = 'dogs.html';
            }
        };

        annyang.addCommands(commands);

        // Start/Stop Audio Controls
        document.getElementById('turn-on-audio')?.addEventListener('click', () => {
            try {
                annyang.start({ autoRestart: true });
                alert('Voice commands enabled! Try saying "Hello"');
            } catch (e) {
                alert('Error enabling voice commands: ' + e.message);
            }
        });

        document.getElementById('turn-off-audio')?.addEventListener('click', () => {
            annyang.abort();
            alert('Voice commands disabled');
        });

        // Start Annyang on all pages
        annyang.start({ autoRestart: true });
    } else {
        console.warn('Annyang not available');
        document.getElementById('audio-instructions')?.insertAdjacentHTML(
            'beforeend',
            '<p class="error">Voice commands not supported in this browser</p>'
        );
    }

    // Set active nav item based on current page
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index2';
    document.querySelectorAll('.nav-item').forEach(item => {
        const itemPage = item.dataset.page || item.textContent.trim().toLowerCase();
        if (itemPage === currentPage || (currentPage === 'index2' && itemPage === 'home')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
});