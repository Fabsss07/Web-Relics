const fs = require('fs/promises')

const SEARCH_TERMS = [
  // general old web
  'home page',
  'homepage',
  'my homepage',
  'welcome to my homepage',
  'personal website',
  'personal page',
  'personal site',
  'family homepage',
  'hobby page',
  'handmade html',
  'classic web',
  'retro web',
  'old web',
  'old internet',
  '90s website',
  '2000s website',
  'home on the web',
  'cyber shrine',
  'cyberspace',
  'world wide web',
  'internet archive style',
  'retro html',
  'vintage website',
  'vintage web',
  'old school website',
  'web design 1999',
  'web design 2000',
  'best viewed',
  'under construction',
  'this site is under construction',
  'welcome to my world',
  'welcome to my website',
  'cool links',
  'favorite links',
  'links page',
  'resources page',
  'bookmark page',
  'guestbook',
  'sign my guestbook',
  'view my guestbook',
  'webring',
  'web ring',
  'join my webring',
  'internet ring',
  'midi',
  'background midi',
  'netscape',
  'internet explorer',
  'frameset',
  'html 3.2',
  'html 4.0',
  'old school html',

  // personal / diary / blog vibes
  'online diary',
  'personal diary',
  'journal page',
  'web journal',
  'my journal',
  'my diary',
  'thoughts page',
  'about me',
  'about this site',
  'who am i',
  'my life',
  'my photos',
  'photo album',
  'family photos',
  'vacation photos',

  // fandom / shrine culture
  'fan page',
  'fansite',
  'fan site',
  'shrine',
  'character shrine',
  'anime shrine',
  'manga shrine',
  'tv show shrine',
  'movie shrine',
  'celebrity shrine',
  'pokemon fan page',
  'digimon fan page',
  'sailor moon shrine',
  'dragon ball fan page',
  'final fantasy fan page',
  'zelda fan page',
  'mario fan page',
  'sonic fan page',
  'kingdom hearts fan page',
  'anime fansite',
  'jpop fan page',
  'boy band fan page',
  'britney spears fan page',
  'linkin park fan page',
  'evanescence fan page',

  // gaming
  'retro games',
  'retro gaming',
  'video game shrine',
  'game fan page',
  'cheat codes',
  'walkthrough',
  'game walkthrough',
  'boss guide',
  'level guide',
  'game secrets',
  'game tips',
  'rpg walkthrough',
  'final fantasy walkthrough',
  'pokemon guide',
  'zelda guide',
  'resident evil guide',
  'silent hill guide',
  'mario guide',
  'cheats page',
  'gamefaqs style',
  'n64 fan page',
  'playstation fan page',
  'ps1 fan page',
  'ps2 fan page',
  'dreamcast fan page',
  'gamecube fan page',
  'retro pc games',
  'flash games page',
  'gaming links',

  // music
  'music fan page',
  'band fan page',
  'album review page',
  'lyrics page',
  'mp3 page',
  'midi music page',
  'vintage music website',
  'retro music page',
  'rock fan page',
  'metal fan page',
  'emo fan page',
  'pop fan page',
  'techno fan page',
  'trance fan page',
  'music shrine',
  'artist shrine',
  'music links',
  'discography page',
  'music collection page',

  // movies / tv / pop culture
  'movie fan page',
  'movie review page',
  'movie shrine',
  'tv show fan page',
  'tv show shrine',
  'space jam website',
  'space jam 1996',
  'star wars fan page',
  'lord of the rings fan page',
  'harry potter fan page',
  'matrix fan page',
  'x files fan page',
  'buffy fan page',
  'simpsons fan page',
  'cartoon network fan page',

  // tech / computing
  'computer tips',
  'windows 98 tips',
  'windows xp tips',
  'dos guide',
  'basic html guide',
  'learn html',
  'webmaster tips',
  'computer hobby page',
  'linux personal page',
  'unix fan page',
  'programming links',
  'javascript tutorial old',
  'computer links',
  'download utilities',
  'freeware page',
  'shareware page',

  // hobbies / niche weirdness
  'train hobby page',
  'lego fan page',
  'doll fan page',
  'stamp collection page',
  'coin collection page',
  'model trains homepage',
  'ham radio homepage',
  'astronomy homepage',
  'space fan page',
  'ufo page',
  'paranormal page',
  'ghost page',
  'conspiracy page',
  'magic tricks page',
  'poetry homepage',
  'art homepage',
  'pixel art page',
  'fantasy art page',
  'dragon art page',
  'cat homepage',
  'dog homepage',
  'pet homepage',

  // geography / schools / clubs
  'school homepage',
  'class homepage',
  'club homepage',
  'unofficial homepage',
  'city guide homepage',
  'travel homepage',
  'europe travel page',
  'japan travel page',
  'student homepage',

  // random old-web language
  'cool page',
  'totally awesome website',
  'awesome links',
  'what\'s new page',
  'site map',
  'awards page',
  'adopt a pixel',
  'blinkies',
  'glitter graphics',
  'pixel dolls',
  'dollz',
  'enter site',
  'skip intro',
  'splash page'
];

const MAX_PAGES_PER_TERM = 10
const MAX_RESULTS = 10000

function normalizeUrl(rawUrl) {
  try {
    const url = new URL(rawUrl)
    url.hash = ""

    if (url.pathname.endsWith("/") && url.pathname !== "/") {
      url.pathname = url.pathname.slice(0, -1)
    }

    return url.toString()
  } catch {
    return null
  }
}

function shuffleArray(array) {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function looksBad(url) {
  const badWords = [
    "porn",
    "sex",
    "xxx",
    "viagra",
    "drugs",
    "nude",
    "guns",
    "weapon",
    "adult"
  ]

  const lower = url.toLowerCase()
  return badWords.some(word => lower.includes(word))
}

async function isAliveHtml(url) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "retro-web-randomizer/1.0"
      }
    })

    clearTimeout(timeout)

    if (!res.ok) return false

    const contentType = res.headers.get("content-type") || ""

    if (!contentType.includes("text/html")) return false

    return true
  } catch {
    return false
  }
}

async function fetchWibyResults(query, page = 1) {
  const apiUrl = `https://wiby.me/json/?q=${encodeURIComponent(query)}&p=${page}`

  const res = await fetch(apiUrl)

  if (!res.ok) throw new Error(`Wiby error ${res.status}`)

  const data = await res.json()

  if (!Array.isArray(data)) return []

  return data
    .map(item => item.URL || item.url || item.Link || item.link)
    .filter(Boolean)
}

async function gatherCandidates() {
  const uniqueUrls = new Set()
  const terms = shuffleArray(SEARCH_TERMS)

  for (const term of terms) {
    for (let page = 1; page <= MAX_PAGES_PER_TERM; page++) {
      console.log(`Searching Wiby: "${term}" page ${page}`)

      try {
        const urls = await fetchWibyResults(term, page)

        if (urls.length === 0) break

        for (const rawUrl of urls) {
          const normalized = normalizeUrl(rawUrl)

          if (!normalized) continue
          if (looksBad(normalized)) continue

          if (uniqueUrls.has(normalized)) continue

          const alive = await isAliveHtml(normalized)

          if (!alive) continue

          uniqueUrls.add(normalized)

          console.log("✓", normalized)

          if (uniqueUrls.size >= MAX_RESULTS) {
            return [...uniqueUrls]
          }
        }
      } catch (error) {
        console.log(`Failed "${term}" page ${page}:`, error.message)
      }
    }
  }

  return [...uniqueUrls]
}

async function main() {
  const candidates = await gatherCandidates()

  await fs.writeFile(
    "relics.json",
    JSON.stringify(candidates.map(url => ({ url })), null, 2)
  )

  console.log(`Saved ${candidates.length} working relic websites`)
}

main()