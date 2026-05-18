import type { SearchEngine } from '../types'

export const searchEngines: SearchEngine[] = [
  { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { name: 'Google', url: 'https://www.google.com/search?q=' },
  { name: 'Brave', url: 'https://search.brave.com/search?q=' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=' },
]
