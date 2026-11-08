const animeData = [
  {id:1,title:"Demon Slayer",genre:"Action",year:"2019",rating:"9.1",episodes:"55+",status:"Popular",description:"A young swordsman joins a dangerous journey to protect humanity and search for a cure for his sister.",colors:["#54265f","#d06b9c","#e8b7e7"],symbol:"鬼"},
  {id:2,title:"Attack on Titan",genre:"Action",year:"2013",rating:"9.4",episodes:"87",status:"Trending",description:"Humanity fights for survival behind enormous walls while uncovering the mysteries of the world.",colors:["#493c32","#d18b50","#e2b28b"],symbol:"進"},
  {id:3,title:"Jujutsu Kaisen",genre:"Fantasy",year:"2020",rating:"9.0",episodes:"47+",status:"Hot",description:"A student enters the hidden world of curses after a fateful encounter with a powerful cursed object.",colors:["#172f53","#5a9bd5","#9dc9ed"],symbol:"呪"},
  {id:4,title:"One Piece",genre:"Adventure",year:"1999",rating:"9.2",episodes:"1000+",status:"Legend",description:"A determined young pirate sails across the seas with his crew in search of the ultimate treasure.",colors:["#174b55","#46a9a1","#b3e3d7"],symbol:"海"},
  {id:5,title:"Your Name",genre:"Romance",year:"2016",rating:"8.9",episodes:"Movie",status:"Movie",description:"Two teenagers discover a mysterious connection that crosses distance, time, and memory.",colors:["#53365f","#bd82c7","#f1c6e8"],symbol:"星"},
  {id:6,title:"Death Note",genre:"Mystery",year:"2006",rating:"9.0",episodes:"37",status:"Classic",description:"A gifted student discovers a notebook with the power to change the fate of anyone whose name is written in it.",colors:["#27223e","#8e77bd","#c4b3ef"],symbol:"夜"},
  {id:7,title:"Spy x Family",genre:"Action",year:"2022",rating:"8.7",episodes:"37+",status:"Popular",description:"A spy, an assassin, and a telepath form an unusual family while each hides a secret identity.",colors:["#384a36","#88ad73","#d1dba9"],symbol:"家"},
  {id:8,title:"Solo Leveling",genre:"Fantasy",year:"2024",rating:"9.1",episodes:"25+",status:"Trending",description:"The weakest hunter gains a mysterious power that lets him grow stronger beyond all limits.",colors:["#172d50","#477dd1","#a9c7fa"],symbol:"影"},
  {id:9,title:"Haikyuu!!",genre:"Adventure",year:"2014",rating:"8.8",episodes:"85",status:"Fan favorite",description:"A passionate volleyball player works with his team to reach the top of the sport.",colors:["#6a3b25","#d98745","#f0c58e"],symbol:"翔"},
  {id:10,title:"Frieren",genre:"Fantasy",year:"2023",rating:"9.3",episodes:"28",status:"Critics' pick",description:"An elven mage reflects on time, friendship, and the meaning of life after a great adventure ends.",colors:["#31505a","#85b9ba","#d4e6df"],symbol:"旅"}
];

const grid = document.getElementById("animeGrid");
const latestList = document.getElementById("latestList");
const searchOverlay = document.getElementById("searchOverlay");
const searchInput = document.getElementById("searchInput");
let activeGenre = "All";
let searchTerm = "";

function posterMarkup(anime, extraClass="") {
  const [bg,orb,figure] = anime.colors;
  return `<div class="poster-art ${extraClass}" style="--poster-bg:${bg};--orb:${orb};--figure:${figure}">
    <div class="poster-orb"></div><div class="poster-figure"></div>
    <span class="poster-symbol">${anime.symbol}</span>
  </div>`;
}

function renderAnime() {
  const filtered = animeData.filter(a => {
    const genreMatch = activeGenre === "All" || a.genre === activeGenre;
    const text = `${a.title} ${a.genre} ${a.year}`.toLowerCase();
    return genreMatch && text.includes(searchTerm.toLowerCase());
  });
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">No anime found. Try another title or genre.</div>`;
    return;
  }
  grid.innerHTML = filtered.map(anime => `
    <article class="anime-card" tabindex="0" role="button" aria-label="View ${anime.title} details" data-id="${anime.id}">
      <div class="poster" style="--poster-bg:${anime.colors[0]}">
        ${posterMarkup(anime)}
        <span class="poster-year">${anime.year}</span>
        <div class="poster-title">${anime.title}</div>
      </div>
      <div class="card-info"><div class="card-title">${anime.title}</div>
        <div class="card-meta"><span>${anime.genre} · ${anime.episodes}</span><span class="rating">★ ${anime.rating}</span></div>
      </div>
    </article>`).join("");
}

function renderLatest() {
  latestList.innerHTML = [...animeData].slice(0,6).map((anime,index) => `
    <article class="latest-item" data-id="${anime.id}" tabindex="0" role="button" aria-label="View ${anime.title}">
      <div class="latest-thumb" style="--poster-bg:${anime.colors[0]}">${anime.symbol}</div>
      <div class="latest-details"><strong>${anime.title}</strong><span>${anime.genre} · Demo listing · ${anime.year}</span></div>
      <span class="episode-pill">${index%2===0 ? "New" : "Explore"}</span>
    </article>`).join("");
}

function openDetails(id) {
  const anime = animeData.find(a => a.id === Number(id));
  if (!anime) return;
  const modal = document.getElementById("animeModal");
  const art = document.getElementById("modalArt");
  art.style.setProperty("--poster-bg", anime.colors[0]);
  art.style.setProperty("--orb", anime.colors[1]);
  art.style.setProperty("--figure", anime.colors[2]);
  art.innerHTML = posterMarkup(anime);
  document.getElementById("modalTitle").textContent = anime.title;
  document.getElementById("modalGenre").textContent = `${anime.genre.toUpperCase()} · ${anime.status.toUpperCase()}`;
  document.getElementById("modalDescription").textContent = anime.description;
  document.getElementById("modalMeta").innerHTML = [`${anime.year}`,`${anime.episodes} episodes`, `★ ${anime.rating}`].map(x=>`<span>${x}</span>`).join("");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
}

function closeDetails() {
  const modal = document.getElementById("animeModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
}

grid.addEventListener("click", e => {
  const card = e.target.closest("[data-id]");
  if (card) openDetails(card.dataset.id);
});
grid.addEventListener("keydown", e => {
  if ((e.key==="Enter" || e.key===" ") && e.target.matches("[data-id]")) {
    e.preventDefault(); openDetails(e.target.dataset.id);
  }
});
latestList.addEventListener("click", e => {
  const item = e.target.closest("[data-id]");
  if (item) openDetails(item.dataset.id);
});
latestList.addEventListener("keydown", e => {
  if ((e.key==="Enter" || e.key===" ") && e.target.matches("[data-id]")) {
    e.preventDefault(); openDetails(e.target.dataset.id);
  }
});

document.querySelectorAll(".filter-chip").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach(b=>b.classList.remove("selected"));
    button.classList.add("selected");
    activeGenre = button.dataset.genre;
    renderAnime();
  });
});

function openSearch() {
  searchOverlay.classList.add("open");
  searchOverlay.setAttribute("aria-hidden","false");
  setTimeout(()=>searchInput.focus(),50);
}
function closeSearch() {
  searchOverlay.classList.remove("open");
  searchOverlay.setAttribute("aria-hidden","true");
  searchInput.value = "";
  searchTerm = "";
  renderAnime();
}
document.getElementById("searchToggle").addEventListener("click",openSearch);
document.getElementById("closeSearch").addEventListener("click",closeSearch);
searchOverlay.addEventListener("click",e=>{if(e.target===searchOverlay)closeSearch();});
searchInput.addEventListener("input",e=>{searchTerm=e.target.value;renderAnime();});
document.getElementById("modalClose").addEventListener("click",closeDetails);
document.getElementById("animeModal").addEventListener("click",e=>{if(e.target.id==="animeModal")closeDetails();});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){closeSearch();closeDetails();}
});
document.getElementById("menuToggle").addEventListener("click",()=>{
  document.querySelector(".main-nav").classList.toggle("open");
});
document.querySelectorAll(".nav-link").forEach(link=>link.addEventListener("click",()=>{
  document.querySelector(".main-nav").classList.remove("open");
}));
document.getElementById("modalAction").addEventListener("click",()=>{
  alert("Streaming will be enabled in a later phase using authorized video sources.");
});
document.getElementById("year").textContent = new Date().getFullYear();

renderAnime();
renderLatest();
