import type { WallpaperKey } from '../types'

export const wallpaperLibrary: Record<WallpaperKey, string> = {
  'wall-default': `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect width="100%" height="100%" fill="#0a0a0c"/></svg>`,
  wall1: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 592 527" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0.146" y1="0.146" x2="0.854" y2="0.854"><stop offset="0" stop-color="#ffffc4"/><stop offset=".5" stop-color="#ff6164"/><stop offset="1" stop-color="#b00012"/></linearGradient></defs><rect width="592" height="527" fill="url(#g)"/></svg>`,
  wall2: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><defs><linearGradient id="g" x1=".5" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="#918c7f"/><stop offset=".5" stop-color="#676d92"/><stop offset="1" stop-color="#063e80"/></linearGradient></defs><rect width="552" height="300" fill="url(#g)"/></svg>`,
  wall3: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0.146" y1="0.854" x2="0.854" y2="0.146"><stop offset="0" stop-color="#fada61"/><stop offset=".5" stop-color="#ff9188"/><stop offset="1" stop-color="#ff5acd"/></linearGradient></defs><rect width="552" height="300" fill="url(#g)"/></svg>`,
  wall4: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0.146" y1="0.854" x2="0.854" y2="0.146"><stop offset="0" stop-color="#8ec5fc"/><stop offset=".25" stop-color="#8dd3ff"/><stop offset=".5" stop-color="#a1d8ff"/><stop offset=".75" stop-color="#c1d2ff"/><stop offset="1" stop-color="#e0c3ff"/></linearGradient></defs><rect width="552" height="300" fill="url(#g)"/></svg>`,
  wall5: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0.146" y1="0.854" x2="0.854" y2="0.146"><stop offset="0" stop-color="#4159d0"/><stop offset=".5" stop-color="#c84fc0"/><stop offset="1" stop-color="#ffcd70"/></linearGradient></defs><rect width="552" height="300" fill="url(#g)"/></svg>`,
  wall6: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1=".5" x2="1" y2=".5"><stop offset="0" stop-color="#d9b3e2"/><stop offset="1" stop-color="#522ca4"/></linearGradient></defs><rect width="552" height="300" fill="url(#g)"/></svg>`,
  wall7: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><rect width="552" height="300" fill="#332b22"/></svg>`,
  wall8: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 552 300" preserveAspectRatio="none"><rect width="552" height="300" fill="#4a57af"/></svg>`,
}

export const brightWallpapers: WallpaperKey[] = ['wall1', 'wall2', 'wall3', 'wall4', 'wall5', 'wall6']

export const wallpaperPreviews: Record<WallpaperKey, string> = {
  'wall-default': 'background:#0a0a0c;border:1px solid rgba(255,255,255,0.2)',
  wall1: 'background:linear-gradient(135deg,#ffffc4,#ff6164,#b00012)',
  wall2: 'background:linear-gradient(180deg,#918c7f,#676d92,#063e80)',
  wall3: 'background:linear-gradient(45deg,#fada61,#ff9188,#ff5acd)',
  wall4: 'background:linear-gradient(45deg,#8ec5fc,#e0c3ff)',
  wall5: 'background:linear-gradient(45deg,#4159d0,#c84fc0,#ffcd70)',
  wall6: 'background:linear-gradient(90deg,#d9b3e2,#522ca4)',
  wall7: 'background:#332b22',
  wall8: 'background:#4a57af',
}
