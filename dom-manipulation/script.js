// Array to hold quote objects
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivational" },
    { text: "The purpose of our lives is to be happy.", category: "Life" },
    // Add more quotes here
];

// Mock server URL
const serverUrl = 'https://jsonplaceholder.typicode.com/posts';

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
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        saveQuotes();
        alert('Quote added successfully!');
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        updateQuotesDisplay();
        populateCategoryFilter(); // Update the category filter when a new quote is added
        syncWithServer(); // Sync with server after adding a quote
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
        populateCategoryFilter();
        syncWithServer(); // Sync with server after importing quotes
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listener for the 'Import Quotes' file input
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Event listener for the 'Export Quotes' button
document.getElementById('exportQuotes').addEventListener('click', exportQuotes);

// Function to populate category filter
function populateCategoryFilter() {
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
}

// Syncing with the server
async function syncWithServer() {
    try {
        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quotes)
        });
        if (response.ok) {
            console.log('Data synced with server');
        }
    } catch (error) {
        console.error('Error syncing data with server:', error);
    }
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(serverUrl);
        const serverQuotes = await response.json();
        const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
        if (JSON.stringify(localQuotes) !== JSON.stringify(serverQuotes)) {
            quotes = serverQuotes;
            saveQuotes();
            updateQuotesDisplay();
            populateCategoryFilter();
            showNotification('Quotes updated from server');
        }
    } catch (error) {
        console.error('Error fetching data from server:', error);
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
    populateCategoryFilter();
    const savedCategory = localStorage.getItem('selectedCategory');
    if (savedCategory) {
        document.getElementById('categoryFilter').value = savedCategory;
        filterQuotes();
    } else {
        updateQuotesDisplay();
    }
    // Periodic fetching of quotes from server
    setInterval(fetchQuotesFromServer, 5000); // Fetch data every 5 seconds
});

// Save selected category to local storage
document.getElementById('categoryFilter').addEventListener('change', () => {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory);
    filterQuotes();
});
