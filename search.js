/**
 * search.js - Finalized with Keyboard Navigation
 */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const suggestionsContainer = document.getElementById('search-suggestions');
    let selectedIndex = -1; // Tracks which suggestion is highlighted

    function isUrl(text) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        return urlPattern.test(text);
    }

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        if (isUrl(query)) {
            let url = query;
            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
            window.location.href = url;
        } else {
            window.location.href = (window.activeEngineUrl || 'https://www.google.com/search?q=') + encodeURIComponent(query);
        }
    });

    // --- KEYBOARD NAVIGATION ---
    searchInput.addEventListener('keydown', (e) => {
        const items = suggestionsContainer.querySelectorAll('.engine-option');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            updateSelection(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateSelection(items);
        } else if (e.key === 'Enter' && selectedIndex > -1) {
            e.preventDefault();
            items[selectedIndex].click(); // Select the highlighted item
        } else if (e.key === 'Escape') {
            suggestionsContainer.classList.add('hidden');
        }
    });

    function updateSelection(items) {
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                item.classList.add('selected');
                searchInput.value = item.textContent; // Update input as user scrolls
            } else {
                item.classList.remove('selected');
            }
        });
    }

    window.handleSuggestions = (data) => {
        const list = (data && Array.isArray(data[1])) ? data[1] : [];
        selectedIndex = -1; // Reset selection when new data arrives
        
        if (list.length === 0) {
            suggestionsContainer.classList.add('hidden');
            return;
        }

        suggestionsContainer.innerHTML = '';
        list.slice(0, 6).forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'engine-option';
            div.textContent = item;
            
            div.onclick = (e) => {
                e.stopPropagation();
                searchInput.value = item;
                suggestionsContainer.classList.add('hidden');
                searchForm.dispatchEvent(new Event('submit'));
            };
            
            // Allow mouse to update the selection index
            div.onmouseenter = () => {
                selectedIndex = index;
                const items = suggestionsContainer.querySelectorAll('.engine-option');
                updateSelection(items);
            };

            suggestionsContainer.appendChild(div);
        });

        suggestionsContainer.classList.remove('hidden');
    };

    let debounce;
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim();
        clearTimeout(debounce);
        if (term.length < 2) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.add('hidden');
            return;
        }

        debounce = setTimeout(() => {
            const oldScript = document.getElementById('jsonp-suggestion');
            if (oldScript) oldScript.remove();
            const script = document.createElement('script');
            script.id = 'jsonp-suggestion';
            script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(term)}&callback=handleSuggestions`;
            document.body.appendChild(script);
        }, 150);
    });

    window.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) suggestionsContainer.classList.add('hidden');
    });
});