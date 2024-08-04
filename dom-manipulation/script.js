const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; // Replace with your server endpoint

// Array to hold quote objects
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivational" },
    { text: "The purpose of our lives is to be happy.", category: "Life" },
    // Add more quotes here
];

// Function to display a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    document.getElementById('quoteDisplay').innerText = `${quote.text} - ${quote.category}`;
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote);
        saveQuotes();
        postQuoteToServer(newQuote);
        alert('Quote added successfully!');
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        updateQuotesDisplay();
        populateCategories(); // Update the category filter when a new quote is added
        syncQuotes(); // Sync with server after adding a quote
    } else {
        alert('Please enter both quote text and category.');
    }
}

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Function to update the display of quotes
function updateQuotesDisplay(filteredQuotes = quotes) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '';
    filteredQuotes.forEach(quote => {
        const quoteElement = document.createElement('div');
        quoteElement.innerText = `${quote.text} - ${quote.category}`;
        quoteDisplay.appendChild(quoteElement);
    });
}

// Function to export quotes to a JSON file
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
        updateQuotesDisplay();
        populateCategories();
        syncQuotes(); // Sync with server after importing quotes
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listener for the 'Import Quotes' file input
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Event listener for the 'Export Quotes' button
document.getElementById('exportQuotes').addEventListener('click', exportQuotes);

// Function to populate category filter
function populateCategories() {
    const categories = new Set(quotes.map(quote => quote.category));
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    updateQuotesDisplay(filteredQuotes);
    localStorage.setItem('selectedCategory', selectedCategory);
}

// Function to sync quotes with server and handle conflicts
async function syncQuotes() {
    try {
        // Fetch current quotes from the server
        const response = await fetch(serverUrl);
        const serverQuotes = await response.json();

        // Convert server quotes to desired format and merge with local quotes
        const formattedServerQuotes = serverQuotes.map(post => ({ text: post.body, category: 'Server' }));
        const combinedQuotes = mergeQuotes(formattedServerQuotes, quotes);

        // Update local storage and display
        quotes = combinedQuotes;
        saveQuotes();
        updateQuotesDisplay();
        populateCategories();

        // Notify user of sync
        showNotification('Quotes synced with server');
    } catch (error) {
        console.error('Error syncing data with server:', error);
    }
}

// Function to merge server and local quotes, resolving conflicts
function mergeQuotes(serverQuotes, localQuotes) {
    const allQuotes = [...serverQuotes, ...localQuotes];
    const uniqueQuotes = [];
    const seen = new Set();

    allQuotes.forEach(quote => {
        if (!seen.has(quote.text)) {
            uniqueQuotes.push(quote);
            seen.add(quote.text);
        }
    });

    return uniqueQuotes;
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(serverUrl);
        const serverQuotes = await response.json();
        const formattedServerQuotes = serverQuotes.map(post => ({ text: post.body, category: 'Server' }));
        quotes.push(...formattedServerQuotes);
        saveQuotes();
        filterQuotes();
        alert('Quotes synchronized with server.');
    } catch (error) {
        console.error('Error fetching quotes from server:', error);
    }
}

// Function to post a new quote to the server
async function postQuoteToServer(newQuote) {
    try {
        await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newQuote)
        });
        showNotification('Quote posted to server');
    } catch (error) {
        console.error('Error posting quote to server:', error);
    }
}

// Function to show notifications
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.innerText = message;
    setTimeout(() => {
        notification.innerText = '';
    }, 3000);
}

// Load quotes from local storage on page load and set up periodic syncing
document.addEventListener('DOMContentLoaded', () => {
    loadQuotes();
    showRandomQuote();
    populateCategories();
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        document.getElementById('categoryFilter').value = savedCategory;
        filterQuotes();
    } else {
        updateQuotesDisplay();
    }
    // Periodic syncing with server
    setInterval(syncQuotes, 5000); // Sync data every 5 seconds
});

// Save selected category to local storage
document.getElementById('categoryFilter').addEventListener('change', () => {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory);
    filterQuotes();
});
