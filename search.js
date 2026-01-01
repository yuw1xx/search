/**
 * search.js - Integrated with History, Delete, and Fixes
 */
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    const suggestionsContainer = document.getElementById('search-suggestions');

    // --- FIX: Restored missing isUrl function ---
    function isUrl(text) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        return urlPattern.test(text);
    }

    function saveToHistory(query) {
        if (!query || !query.trim()) return;
        let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        history = [query, ...history.filter(h => h !== query)].slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    window.deleteHistoryItem = (e, term) => {
        e.stopPropagation(); 
        let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        history = history.filter(h => h !== term);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        renderHistory(); 
    };

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        if (history.length > 0 && searchInput.value === "") {
            suggestionsContainer.innerHTML = history.map(term => `
                <div class="engine-option history-item" onclick="executeHistorySearch('${term}')">
                    <div class="history-left">
                        <span>🕒 ${term}</span>
                    </div>
                    <div class="history-delete" onclick="window.deleteHistoryItem(event, '${term}')">✕</div>
                </div>
            `).join('');
            suggestionsContainer.classList.remove('hidden');
        } else if (searchInput.value === "") {
            suggestionsContainer.classList.add('hidden');
        }
    }

    window.executeHistorySearch = (term) => {
        searchInput.value = term;
        searchForm.dispatchEvent(new Event('submit'));
    };

    // --- SUBMIT LOGIC (Now fixed because isUrl exists) ---
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        saveToHistory(query);

        if (isUrl(query)) {
            let url = query;
            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
            window.location.href = url;
        } else {
            const engineUrl = window.activeEngineUrl || 'https://www.google.com/search?q=';
            window.location.href = engineUrl + encodeURIComponent(query);
        }
    });

    searchInput.addEventListener('focus', renderHistory);

    // Suggestions (JSONP)
    window.handleSuggestions = (data) => {
        const list = (data && Array.isArray(data[1])) ? data[1] : [];
        if (list.length === 0) {
            suggestionsContainer.classList.add('hidden');
            return;
        }
        suggestionsContainer.innerHTML = '';
        list.slice(0, 6).forEach((item) => {
            const div = document.createElement('div');
            div.className = 'engine-option';
            div.textContent = item;
            div.onclick = (e) => {
                e.stopPropagation();
                searchInput.value = item;
                suggestionsContainer.classList.add('hidden');
                searchForm.dispatchEvent(new Event('submit'));
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
            renderHistory();
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