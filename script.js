// ELEMENTS
const outline = document.querySelector('.cursor-outline');
const searchInput = document.getElementById('search-input');
const searchForm = document.getElementById('search-form');
const engineNameDisplay = document.getElementById('current-engine-name');
const engineMenu = document.getElementById('engine-menu');
const settingsMenu = document.getElementById('settings-menu');

// ATTACH TO WINDOW: Ensures search.js can read the URL safely
window.activeEngineUrl = localStorage.getItem('preferredEngineUrl') || 'https://duckduckgo.com/?q=';

// --- WALLPAPER LIBRARY ---
const wallpaperLibrary = {
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

document.addEventListener('click', (e) => {
    const wallBtn = e.target.closest('.wall-opt');
    if (wallBtn) window.setWallpaper(wallBtn.getAttribute('data-wall'));
    if (e.target.closest('.settings-menu .engine-option')) {
        window.setClock(e.target.innerText.toLowerCase().includes('analog') ? 'analog' : 'digital');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const savedWall = localStorage.getItem('preferredWallpaper') || 'wall-default';
    window.setWallpaper(savedWall);
    const savedClock = localStorage.getItem('preferredClock') || 'analog';
    window.setClock(savedClock);

    // FIX: Explicitly hide modal on load
    document.getElementById('shortcut-modal')?.classList.add('hidden');

    const savedEngineName = localStorage.getItem('preferredEngineName') || 'DuckDuckGo';
    if (engineNameDisplay) engineNameDisplay.innerText = savedEngineName;

    renderShortcuts();
});

// UI INTERACTION
const engineTrigger = document.getElementById('engine-trigger');

engineTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    engineMenu.classList.toggle('hidden');
    settingsMenu.classList.add('hidden');
});
document.getElementById('settings-trigger')?.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle('hidden');
    engineMenu.classList.add('hidden');
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

window.addEventListener('click', () => {
    engineMenu.classList.add('hidden');
    settingsMenu.classList.add('hidden');
});

// CURSOR Logic
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.16;
    cursorY += (mouseY - cursorY) * 0.16;
    if(outline) { outline.style.left = `${cursorX}px`; outline.style.top = `${cursorY}px`; }
    requestAnimationFrame(animateCursor);
}
animateCursor();

document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, .engine-option, .shortcut-item, .settings-btn, #engine-trigger')) {
        document.body.classList.add('cursor-active');
    }
});
document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, input, .engine-option, .shortcut-item, .settings-btn, #engine-trigger')) {
        document.body.classList.remove('cursor-active');
    }
});

// CLOCK
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
    const analog = document.getElementById('analog-clock'), digital = document.getElementById('digital-clock');
    if (type === 'analog') { digital?.classList.remove('clock-active'); analog?.classList.add('clock-active'); }
    else { analog?.classList.remove('clock-active'); digital?.classList.add('clock-active'); }
    localStorage.setItem('preferredClock', type);
};

// SHORTCUTS Logic
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
const bar = document.getElementById('shortcuts-bar'), actionPopup = document.getElementById('shortcut-actions'), modal = document.getElementById('shortcut-modal');
let currentEditId = null, selectedIconId = 'web', activeHoverIndex = null;

function renderShortcuts() {
    if(!bar) return;
    const addBtn = document.getElementById('open-shortcut-modal');
    bar.querySelectorAll('.shortcut-item').forEach(i => i.remove());

    shortcuts.forEach((s, index) => {
        const item = document.createElement('div');
        item.className = 'shortcut-item';
        item.innerHTML = iconLibrary[s.icon] || iconLibrary['web'];

        let timer;
        let isLongPress = false;

        // --- MOBILE TOUCH LOGIC ---
        item.addEventListener('touchstart', (e) => {
            isLongPress = false;
            timer = setTimeout(() => {
                isLongPress = true;
                if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
                openModal(index);
            }, 600); // 600ms hold time
        }, { passive: true });

        item.addEventListener('touchend', (e) => {
            clearTimeout(timer);
            if (isLongPress) {
                e.preventDefault(); // Stop the click from happening
            }
        });

        item.addEventListener('touchmove', () => clearTimeout(timer));

        // --- CLICK LOGIC (Works for both Mobile & Desktop) ---
        item.onclick = (e) => {
            // If it was a long press or a click on the edit menu, don't navigate
            if (isLongPress || (actionPopup && actionPopup.contains(e.target))) {
                e.preventDefault();
                return;
            }
            window.location.href = s.url;
        };

        // --- DESKTOP HOVER (Optional) ---
        item.onmouseenter = () => {
            if(window.innerWidth > 768) {
                activeHoverIndex = index;
                item.appendChild(actionPopup);
                actionPopup.classList.remove('hidden');
            }
        };

        bar.insertBefore(item, addBtn);
    });
}

// FIX: Improved click handling for opening modal
document.getElementById('open-shortcut-modal')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
});

// FIX: Close modal logic
document.getElementById('close-modal').onclick = (e) => {
    e.preventDefault();
    modal.classList.add('hidden');
};

actionPopup.querySelector('.edit-btn').onclick = (e) => { e.stopPropagation(); openModal(activeHoverIndex); };
actionPopup.querySelector('.delete-btn').onclick = (e) => { e.stopPropagation(); shortcuts.splice(activeHoverIndex, 1); localStorage.setItem('myShortcuts', JSON.stringify(shortcuts)); actionPopup.classList.add('hidden'); renderShortcuts(); };

document.getElementById('save-shortcut').onclick = (e) => {
    e.preventDefault();

    // Define limits
    const isMobile = window.innerWidth <= 768;
    const limit = isMobile ? 5 : 10;

    // Check if we are adding a NEW shortcut (currentEditId is null)
    if (currentEditId === null && shortcuts.length >= limit) {
        alert(`Limit reached! You can only have ${limit} shortcuts on this device.`);
        return;
    }

    const name = document.getElementById('shortcut-name').value.trim();
    let url = document.getElementById('shortcut-url').value.trim();

    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

        const data = { name, url, icon: selectedIconId };

    if (currentEditId !== null) {
        shortcuts[currentEditId] = data;
    } else {
        shortcuts.push(data);
    }

    localStorage.setItem('myShortcuts', JSON.stringify(shortcuts));
    modal.classList.add('hidden');
    renderShortcuts();
};

document.getElementById('delete-shortcut').onclick = (e) => {
    e.preventDefault();
    if (currentEditId !== null) {
        shortcuts.splice(currentEditId, 1); // Remove the item
        localStorage.setItem('myShortcuts', JSON.stringify(shortcuts));
        modal.classList.add('hidden'); // Close modal
        renderShortcuts(); // Refresh the bar
    }
};

function openModal(idx = null) {
    currentEditId = idx;
    modal.classList.remove('hidden');
    actionPopup.classList.add('hidden');

    const deleteBtn = document.getElementById('delete-shortcut');

    if(idx !== null) {
        // Editing: Show the delete button
        document.getElementById('shortcut-name').value = shortcuts[idx].name;
        document.getElementById('shortcut-url').value = shortcuts[idx].url;
        selectedIconId = shortcuts[idx].icon;
        deleteBtn?.classList.remove('hidden');
    }
    else {
        // Adding New: Hide the delete button
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

// MOBILE VIEWPORT HEIGHT FIX
const setMobileHeight = () => {
    // Calculates 1% of the actual visible inner height
    let vh = window.innerHeight * 0.01;
    // Sets the --vh custom property on the root element
    document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Listen for orientation changes and window resizing
window.addEventListener('resize', setMobileHeight);
window.addEventListener('orientationchange', setMobileHeight);

// Initial calculation
setMobileHeight();
