/* --- GLOBAL ELEMENTS & STATE --- */
const outline = document.querySelector('.cursor-outline');
const searchInput = document.getElementById('search-input');
const searchForm = document.getElementById('search-form');
const engineNameDisplay = document.getElementById('current-engine-name');
const engineMenu = document.getElementById('engine-menu');
const settingsModal = document.getElementById('settings-modal');
const settingsTrigger = document.getElementById('settings-trigger');
const closeSettingsBtn = document.getElementById('close-settings');

// State variables - Declared ONCE to prevent redeclaration errors
let cityDebounce;
const API_KEY = '23b6d102b049f8bd45b89327abfa9d24';

// ATTACH TO WINDOW: Ensures search.js can read the URL safely
window.activeEngineUrl = localStorage.getItem('preferredEngineUrl') || 'https://duckduckgo.com/?q=';

/* --- SETTINGS & TAB LOGIC --- */
window.switchTab = (tabName) => {
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === tabName.toLowerCase()) {
            btn.classList.add('active');
        }
    });
    document.querySelectorAll('.settings-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    const targetPane = document.getElementById(`pane-${tabName}`);
    if (targetPane) {
        targetPane.classList.add('active');
    }
};

settingsTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsModal?.classList.remove('hidden');
    engineMenu?.classList.add('hidden');
    window.switchTab('appearance');
});

closeSettingsBtn?.addEventListener('click', () => {
    settingsModal?.classList.add('hidden');
});

window.clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    document.getElementById('search-suggestions')?.classList.add('hidden');
    showToast("History cleared!");
};

/* --- CUSTOM NOTIFICATION LOGIC --- */
function showToast(message) {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;
    toast.innerText = message;
    toast.classList.remove('hidden');
    void toast.offsetWidth;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}

/* --- WEATHER & LOCATION LOGIC --- */
window.toggleWeatherVisibility = () => {
    const checkbox = document.getElementById('weather-toggle-checkbox');
    const shouldHide = !checkbox.checked;

    localStorage.setItem('hideWeather', shouldHide);
    applyWeatherVisibility();

    showToast(shouldHide ? "Weather hidden" : "Weather visible");
};

function applyWeatherVisibility() {
    const isHidden = localStorage.getItem('hideWeather') === 'true';
    const widget = document.getElementById('weather-widget');
    const checkbox = document.getElementById('weather-toggle-checkbox');

    if (widget) {
        widget.style.display = isHidden ? 'none' : 'flex';
    }

    if (checkbox) {
        checkbox.checked = !isHidden;
    }
}

window.setWeatherUnits = (unit) => {
    localStorage.setItem('preferredUnits', unit);
    initWeather();
    showToast(`Units set to ${unit === 'metric' ? 'Celsius' : 'Fahrenheit'}`);
};

window.requestGPS = () => {
    localStorage.removeItem('manualWeatherLocation');
    showToast("Requesting GPS access...");
    initWeather();
};

window.forceRefreshWeather = () => {
    showToast("Refreshing weather data...");
    initWeather();
};

window.saveManualLocation = async () => {
    const cityInputElem = document.getElementById('manual-city-input');
    const city = cityInputElem.value.trim();
    if (!city) {
        showToast("Please enter a city name.");
        return;
    }
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`);
        const data = await res.json();
        if (data.cod === 200) {
            localStorage.setItem('manualWeatherLocation', city);
            initWeather();
            showToast(`Location confirmed: ${data.name}`);
        } else {
            showToast("City not found.");
        }
    } catch (e) {
        showToast("Error connecting to weather service.");
    }
};

async function initWeather() {
    const widget = document.getElementById('weather-widget');
    const statusText = document.getElementById('weather-status-text');
    const savedCity = localStorage.getItem('manualWeatherLocation');
    const units = localStorage.getItem('preferredUnits') || 'metric';

    const getIcon = (code) => {
        const icons = {
            storm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 11h-4.91L17 3h-8l-4 10h5l-2 8l11-10z"/></svg>`,
            rain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 13a4 4 0 0 1-8 0"/><path d="M8 19v2M12 21v2M16 19v2"/></svg>`,
            snow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"/></svg>`,
            fog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h16M4 14h16M4 18h16M4 6h16"/></svg>`,
            sunny: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
            cloudy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`
        };
        if (code >= 200 && code < 300) return icons.storm;
        if (code >= 300 && code < 600) return icons.rain;
        if (code >= 600 && code < 700) return icons.snow;
        if (code >= 700 && code < 800) return icons.fog;
        if (code === 800) return icons.sunny;
        return icons.cloudy;
    };

    const updateWeatherUI = async (url) => {
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.cod === 200) {
                document.getElementById('weather-city').innerText = data.name;
                document.getElementById('weather-temp').innerText = `${Math.round(data.main.temp)}${units === 'metric' ? '°C' : '°F'}`;
                document.getElementById('weather-desc').innerText = data.weather[0].description;
                document.getElementById('weather-icon-container').innerHTML = getIcon(data.weather[0].id);
                if (statusText) statusText.innerText = `Weather for ${data.name}`;
                widget.classList.remove('hidden');
                widget.style.opacity = "1";
                widget.style.transform = "translateY(0)";
            }
        } catch (e) { console.warn("Weather sync failed", e); }
    };

    if (savedCity) {
        updateWeatherUI(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(savedCity)}&units=${units}&appid=${API_KEY}`);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (p) => updateWeatherUI(`https://api.openweathermap.org/data/2.5/weather?lat=${p.coords.latitude}&lon=${p.coords.longitude}&units=${units}&appid=${API_KEY}`),
                                                 () => updateWeatherUI(`https://api.openweathermap.org/data/2.5/weather?lat=49.1951&lon=16.6068&units=${units}&appid=${API_KEY}`),
                                                 { enableHighAccuracy: true, timeout: 5000 }
        );
    }
}

/* --- CITY SUGGESTIONS WITH DUPLICATE FILTERING --- */
const cityInputElem = document.getElementById('manual-city-input');
const citySuggElem = document.getElementById('city-suggestions');

cityInputElem?.addEventListener('input', (e) => {
    const term = e.target.value.trim();
    clearTimeout(cityDebounce);
    if (term.length < 3) { citySuggElem?.classList.add('hidden'); return; }

    cityDebounce = setTimeout(async () => {
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(term)}&limit=5&appid=${API_KEY}`;
        try {
            const res = await fetch(url);
            const locs = await res.json();
            if (!locs.length) { citySuggElem?.classList.add('hidden'); return; }

            const uniqueLocations = [];
            const seenKeys = new Set();
            locs.forEach(l => {
                const key = `${l.name.toLowerCase()},${l.country.toLowerCase()}`;
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueLocations.push(l);
                }
            });

            citySuggElem.innerHTML = '';
            uniqueLocations.slice(0, 3).forEach(l => {
                const d = document.createElement('div');
                d.className = 'city-suggestion-item';
                d.textContent = `${l.name}, ${l.country}`;
                d.onclick = () => {
                    cityInputElem.value = l.name;
                    citySuggElem.classList.add('hidden');
                    localStorage.setItem('manualWeatherLocation', l.name);
                    initWeather();
                    showToast(`Location set: ${l.name}`);
                };
                citySuggElem.appendChild(d);
            });
            citySuggElem.classList.remove('hidden');
        } catch (e) { console.warn("Suggestion fetch failed", e); }
    }, 400);
});

/* --- WALLPAPER LIBRARY --- */
const wallpaperLibrary = {
    'wall-default': `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect width="100%" height="100%" fill="#0a0a0c"/></svg>`,
    wall1: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 592 527" preserveAspectRatio="none"><defs><linearGradient id="gradient" x1="0.146" y1="0.146" x2="0.854" y2="0.854"><stop offset="0.000" stop-color="#ffffc4" /><stop offset="0.500" stop-color="#ff6164" /><stop offset="1.000" stop-color="#b00012" /></linearGradient></defs><rect x="0" y="0" width="592" height="527" fill="url(#gradient)" /></svg>`,
    wall2: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><defs><linearGradient id="gradient" x1="0.500" y1="0.000" x2="0.500" y2="1.000"><stop offset="0.000" stop-color="#918c7f" /><stop offset="0.500" stop-color="#676d92" /><stop offset="1.000" stop-color="#063e80" /></linearGradient></defs><rect x="0" y="0" width="552" height="300" fill="url(#gradient)" /></svg>`,
    wall3: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><defs><linearGradient id="gradient" x1="0.146" y1="0.854" x2="0.854" y2="0.146"><stop offset="0.000" stop-color="#fada61" /><stop offset="0.500" stop-color="#ff9188" /><stop offset="1.000" stop-color="#ff5acd" /></linearGradient></defs><rect x="0" y="0" width="552" height="300" fill="url(#gradient)" /></svg>`,
    wall4: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><defs><linearGradient id="gradient" x1="0.146" y1="0.854" x2="0.854" y2="0.146"><stop offset="0.000" stop-color="#8ec5fc" /><stop offset="0.250" stop-color="#8dd3ff" /><stop offset="0.500" stop-color="#a1d8ff" /><stop offset="0.750" stop-color="#c1d2ff" /><stop offset="1.000" stop-color="#e0c3ff" /></linearGradient></defs><rect x="0" y="0" width="552" height="300" fill="url(#gradient)" /></svg>`,
    wall5: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><defs><linearGradient id="gradient" x1="0.146" y1="0.854" x2="0.854" y2="0.146"><stop offset="0.000" stop-color="#4159d0" /><stop offset="0.500" stop-color="#c84fc0" /><stop offset="1.000" stop-color="#ffcd70" /></linearGradient></defs><rect x="0" y="0" width="552" height="300" fill="url(#gradient)" /></svg>`,
    wall6: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><defs><linearGradient id="gradient" x1="0.000" y1="0.500" x2="1.000" y2="0.500"><stop offset="0.000" stop-color="#d9b3e2" /><stop offset="1.000" stop-color="#522ca4" /></linearGradient></defs><rect x="0" y="0" width="552" height="300" fill="url(#gradient)" /></svg>`,
    wall7: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><rect x="0" y="0" width="552" height="300" fill="#332b22" /></svg>`,
    wall8: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><rect x="0" y="0" width="552" height="300" fill="#4a57af" /></svg>`
};

const brightWallpapers = ['wall1', 'wall2', 'wall3', 'wall4', 'wall5', 'wall6'];

window.setWallpaper = (id) => {
    const container = document.getElementById('wallpaper-container');
    const body = document.body;
    if (!container) return;
    container.classList.add('wall-fade-out');
    setTimeout(() => {
        container.innerHTML = wallpaperLibrary[id] || '';
        body.classList.toggle('light-theme', brightWallpapers.includes(id));
        container.classList.remove('wall-fade-out');
        localStorage.setItem('preferredWallpaper', id || 'wall-default');
    }, 400);
    document.querySelectorAll('.wall-opt').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-wall') === (id || 'wall-default'));
    });
};

/* --- FONT & CLOCK VISIBILITY LOGIC --- */
window.setFont = (font) => {
    localStorage.setItem('preferredFont', font);
    document.documentElement.style.setProperty('--main-font', font);
    showToast("Font updated");
};

function applyFont() {
    const savedFont = localStorage.getItem('preferredFont') || "'Inter', sans-serif";
    document.documentElement.style.setProperty('--main-font', savedFont);

    const selector = document.getElementById('font-selector');
    if (selector) selector.value = savedFont;
}

window.toggleClockVisibility = () => {
    const isHidden = localStorage.getItem('hideClock') === 'true';
    const newState = !isHidden;
    localStorage.setItem('hideClock', newState);
    applyClockVisibility();
    showToast(newState ? "Clock hidden" : "Clock visible");
};

function applyClockVisibility() {
    const isHidden = localStorage.getItem('hideClock') === 'true';
    const analog = document.getElementById('analog-clock');
    const digital = document.getElementById('digital-clock');
    const checkbox = document.getElementById('clock-toggle-checkbox');

    const displayStyle = isHidden ? 'none' : '';
    if (analog) analog.style.display = displayStyle;
    if (digital) digital.style.display = displayStyle;

    if (checkbox) checkbox.checked = !isHidden;
}

/* --- INITIALIZATION --- */
document.addEventListener('DOMContentLoaded', () => {
    const savedWall = localStorage.getItem('preferredWallpaper') || 'wall-default';
    window.setWallpaper(savedWall);
    const savedClock = localStorage.getItem('preferredClock') || 'analog';
    window.setClock(savedClock);

    document.querySelectorAll('.wall-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            window.setWallpaper(opt.getAttribute('data-wall'));
        });
    });

    document.getElementById('shortcut-modal')?.classList.add('hidden');
    if (settingsModal) settingsModal.classList.add('hidden');

    const savedEngineName = localStorage.getItem('preferredEngineName') || 'DuckDuckGo';
    if (document.getElementById('current-engine-name')) {
        document.getElementById('current-engine-name').innerText = savedEngineName;
    }

    applyFont();
    applyClockVisibility();
    applyWeatherVisibility();
    renderShortcuts();
    initWeather();

    // Non-alert popup listeners
    document.querySelector('.edit-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeHoverIndex !== null) openModal(activeHoverIndex);
    });

        document.querySelector('.delete-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeHoverIndex !== null) {
                shortcuts.splice(activeHoverIndex, 1);
                localStorage.setItem('myShortcuts', JSON.stringify(shortcuts));
                renderShortcuts();
                actionPopup.classList.add('hidden');
                showToast("Shortcut removed");
            }
        });
});

/* --- UI INTERACTION --- */
const engineTrigger = document.getElementById('engine-trigger');

engineTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    engineMenu.classList.toggle('hidden');
    settingsModal?.classList.add('hidden');
});

document.querySelectorAll('.engine-option').forEach(option => {
    option.addEventListener('click', () => {
        const url = option.getAttribute('data-url');
        const name = option.getAttribute('data-engine');
        if (url && name) {
            window.activeEngineUrl = url;
            engineNameDisplay.innerText = name;
            localStorage.setItem('preferredEngineName', name);
            localStorage.setItem('preferredEngineUrl', url);
            engineMenu.classList.add('hidden');
        }
    });
});

window.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.add('hidden');
    if (e.target.classList.contains('modal-overlay')) e.target.classList.add('hidden');
    if (!e.target.closest('.modal-content')) {
        engineMenu?.classList.add('hidden');
    }
});

/* --- CURSOR & CLOCK LOGIC --- */
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.16;
    cursorY += (mouseY - cursorY) * 0.16;
    if(outline) { outline.style.left = `${cursorX}px`; outline.style.top = `${cursorY}px`; }
    requestAnimationFrame(animateCursor);
}
animateCursor();

function tick() {
    const now = new Date();
    const s = now.getSeconds(), m = now.getMinutes(), h = now.getHours();
    const sHand = document.getElementById('second-hand'), mHand = document.getElementById('minute-hand'), hHand = document.getElementById('hour-hand'), digital = document.getElementById('digital-clock');
    if (sHand) sHand.style.transform = `rotate(${(s/60)*360}deg)`;
    if (mHand) mHand.style.transform = `rotate(${(m/60)*360 + (s/60)*6}deg)`;
    if (hHand) hHand.style.transform = `rotate(${(h%12/12)*360 + (m/60)*30}deg)`;
    if (digital) digital.innerText = now.toLocaleTimeString('en-GB');
}
setInterval(tick, 1000); tick();

window.setClock = (type) => {
    const analog = document.getElementById('analog-clock');
    const digital = document.getElementById('digital-clock');
    analog?.classList.remove('clock-active');
    digital?.classList.remove('clock-active');
    requestAnimationFrame(() => {
        setTimeout(() => {
            if (type === 'analog') analog?.classList.add('clock-active');
            else digital?.classList.add('clock-active');
        }, 30);
    });
    localStorage.setItem('preferredClock', type);
};

/* --- SHORTCUTS Logic --- */
const iconLibrary = {
    web: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    github: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>',
    mail: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    reddit: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M17 13c-1 1-3 1-4-1-1 2-3 2-4 1"/><line x1="16" y1="9" x2="16" y2="9.01"/><line x1="9" y1="9" x2="9" y2="9.01"/></svg>',
    twitch: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"/></svg>',
    code: '<svg viewBox="0 0 24 24" width="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>'
};

let shortcuts = JSON.parse(localStorage.getItem('myShortcuts')) || [];
const bar = document.getElementById('shortcuts-bar');
const actionPopup = document.getElementById('shortcut-actions');
const shortcutModal = document.getElementById('shortcut-modal');
let currentEditId = null, selectedIconId = 'web', activeHoverIndex = null;

function renderShortcuts() {
    if(!bar) return;
    const addBtn = document.getElementById('open-shortcut-modal');
    bar.querySelectorAll('.shortcut-item').forEach(i => i.remove());

    shortcuts.forEach((s, index) => {
        const item = document.createElement('div');
        item.className = 'shortcut-item';
        item.innerHTML = iconLibrary[s.icon] || iconLibrary['web'];
        item.onclick = (e) => {
            if (shortcutModal.classList.contains('hidden')) window.location.href = s.url;
        };
            item.onmouseenter = () => {
                if(window.innerWidth > 768) {
                    activeHoverIndex = index;
                    item.appendChild(actionPopup);
                    actionPopup.classList.remove('hidden');
                }
            };
            item.onmouseleave = () => {
                actionPopup.classList.add('hidden');
            };
            bar.insertBefore(item, addBtn);
    });
}

function openModal(idx = null) {
    currentEditId = idx;
    shortcutModal.classList.remove('hidden');
    actionPopup.classList.add('hidden');
    const deleteBtn = document.getElementById('delete-shortcut');
    if(idx !== null) {
        document.getElementById('shortcut-name').value = shortcuts[idx].name;
        document.getElementById('shortcut-url').value = shortcuts[idx].url;
        selectedIconId = shortcuts[idx].icon;
        deleteBtn?.classList.remove('hidden');
    } else {
        document.getElementById('shortcut-name').value = '';
        document.getElementById('shortcut-url').value = '';
        selectedIconId = 'web';
        deleteBtn?.classList.add('hidden');
    }
    renderIconSelector();
}

function renderIconSelector() {
    const grid = document.getElementById('icon-grid'); if(!grid) return; grid.innerHTML = '';
    Object.entries(iconLibrary).forEach(([k, svg]) => {
        const o = document.createElement('div'); o.className = `icon-option ${k===selectedIconId?'selected':''}`; o.innerHTML = svg;
        o.onclick = () => { selectedIconId = k; renderIconSelector(); }; grid.appendChild(o);
    });
}

document.getElementById('open-shortcut-modal')?.addEventListener('click', () => openModal());
document.getElementById('close-modal')?.addEventListener('click', () => shortcutModal.classList.add('hidden'));

document.getElementById('save-shortcut')?.addEventListener('click', (e) => {
    e.preventDefault();
    const name = document.getElementById('shortcut-name').value.trim();
    let url = document.getElementById('shortcut-url').value.trim();
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        const data = { name, url, icon: selectedIconId };
    if (currentEditId !== null) shortcuts[currentEditId] = data;
    else shortcuts.push(data);
    localStorage.setItem('myShortcuts', JSON.stringify(shortcuts));
    shortcutModal.classList.add('hidden');
    renderShortcuts();
});

document.getElementById('delete-shortcut')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentEditId !== null) {
        shortcuts.splice(currentEditId, 1);
        localStorage.setItem('myShortcuts', JSON.stringify(shortcuts));
        shortcutModal.classList.add('hidden');
        renderShortcuts();
        showToast("Shortcut removed");
    }
});
