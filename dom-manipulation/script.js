document.addEventListener('DOMContentLoaded', () => {
    const quotes = [
      { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
      { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
      { text: "Good artists copy, great artists steal.", category: "Creativity" }
    ];
  
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteButton = document.getElementById('newQuote');
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');
    const addQuoteButton = document.getElementById('addQuoteButton');
  
    const showRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const quote = quotes[randomIndex];
      quoteDisplay.innerHTML = `"${quote.text}" - ${quote.category}`;
    };
  
    const createAddQuoteForm = () => {
      const text = newQuoteText.value.trim();
      const category = newQuoteCategory.value.trim();
      
      if (text && category) {
        quotes.push({ text, category });
        newQuoteText.value = '';
        newQuoteCategory.value = '';
        alert('Quote added successfully!');
      } else {
        alert('Please enter both quote and category.');
      }
    };
  
    newQuoteButton.addEventListener('click', showRandomQuote);
    addQuoteButton.addEventListener('click', createAddQuoteForm);
  
    // Show a random quote on initial load
    showRandomQuote();

  });