const randomBtn = document.getElementById("randomBtn")

let websites = []
let queue = []
let history = []

function shuffleArray(array) {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function refillQueue() {
  queue = shuffleArray(websites)

  if (
    history.length > 0 &&
    queue.length > 1 &&
    queue[0].url === history[history.length - 1].url
  ) {
    ;[queue[0], queue[1]] = [queue[1], queue[0]]
  }
}

fetch("./relics.json")
  .then(res => res.json())
  .then(data => {
    websites = data
    refillQueue()
  })

randomBtn.addEventListener("click", () => {
  if (queue.length === 0) {
    refillQueue()
  }

  const website = queue.shift()

  history.push(website)

  if (history.length > 1000) {
    history.shift()
  }

  window.open(website.url, "_blank")
})