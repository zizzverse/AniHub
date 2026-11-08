import { auth, db, firebaseReady } from "../js/firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, getIdTokenResult } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $ = id => document.getElementById(id);
const authPanel=$("authPanel"), dashboard=$("dashboard");
let selectedAnimeId=null, selectedAnime=null, seasons=[];
function message(id,text,error=false){const el=$(id);el.textContent=text;el.classList.toggle("error",error);}
function splitList(value){return value.split(",").map(v=>v.trim()).filter(Boolean);}
function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
function requireFirebase(){if(!firebaseReady||!auth||!db){message("authMessage","Firebase is not configured. Follow SETUP.md and edit firebase/firebase-config.js.",true);return false;}return true;}

$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault(); if(!requireFirebase())return;
  message("authMessage","Signing in…");
  try{await signInWithEmailAndPassword(auth,$("email").value.trim(),$("password").value);}
  catch(err){message("authMessage",err.code==="auth/invalid-credential"?"Email or password is incorrect.":err.message,true);}
});
$("signOut").addEventListener("click",()=>signOut(auth));
if(auth) onAuthStateChanged(auth,user=>{
  if(!user){authPanel.hidden=false;dashboard.hidden=true;return;}
  user.getIdToken(true).then(async()=>{
    const token=await getIdTokenResult(user);
    if(token.claims.admin!==true){await signOut(auth);message("authMessage","This account is signed in but is not an authorized AniHub admin. Ask the project owner to grant the admin custom claim.",true);return;}
    authPanel.hidden=true;dashboard.hidden=false;$("adminEmail").textContent=user.email||user.uid;loadCatalog();
  }).catch(err=>{message("authMessage",err.message,true);});
});
else { authPanel.hidden=false; dashboard.hidden=true; message("authMessage","Firebase is not configured. Follow SETUP.md and edit firebase/firebase-config.js.",true); }

async function loadCatalog(){
  try{
    const snap=await getDocs(query(collection(db,"anime"),orderBy("title")));
    $("animeCount").textContent=snap.size;
    $("catalogList").innerHTML=snap.empty?'<p class="muted">No anime yet. Add your first catalog entry.</p>':snap.docs.map(d=>{const a=d.data();return `<article class="catalog-item"><div><strong>${escapeHTML(a.title||"Untitled")}</strong><small>${escapeHTML((a.genre||[]).join(", "))} · ${escapeHTML(a.year||"Year TBA")}</small></div><div class="item-actions"><button data-edit="${d.id}" class="mini">Edit</button><button data-select="${d.id}" class="mini">Seasons</button><button data-delete="${d.id}" class="mini danger">Delete</button></div></article>`;}).join("");
  }catch(err){$("catalogList").innerHTML=`<p class="message error">Could not load catalog: ${escapeHTML(err.message)}</p>`;}
}
$("catalogList").addEventListener("click",async e=>{
  const edit=e.target.closest("[data-edit]"),select=e.target.closest("[data-select]"),del=e.target.closest("[data-delete]");
  if(edit){const d=await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");const snap=await d.getDoc(d.doc(db,"anime",edit.dataset.edit));if(snap.exists())fillAnimeForm(snap.id,snap.data());}
  if(select){const d=await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");const snap=await d.getDoc(d.doc(db,"anime",select.dataset.select));if(snap.exists()){selectedAnimeId=snap.id;selectedAnime=snap.data();$("selectedTitle").textContent=selectedAnime.title;await loadSeasons();}}
  if(del&&confirm("Delete this anime and all its seasons and episodes? This cannot be undone.")){
    try{const animeId=del.dataset.delete;const seasonSnap=await getDocs(collection(db,"anime",animeId,"seasons"));for(const seasonDoc of seasonSnap.docs){const epSnap=await getDocs(collection(db,"anime",animeId,"seasons",seasonDoc.id,"episodes"));for(const ep of epSnap.docs)await deleteDoc(ep.ref);await deleteDoc(seasonDoc.ref);}await deleteDoc(doc(db,"anime",animeId));if(selectedAnimeId===animeId){selectedAnimeId=null;selectedAnime=null;seasons=[];$("selectedTitle").textContent="None";$("seasonList").innerHTML='<p class="muted">Choose an anime to view seasons.</p>';$("episodeSeason").innerHTML='<option value="">Select season</option>';}message("animeMessage","Anime and its nested seasons/episodes deleted.");await loadCatalog();}catch(err){message("animeMessage",err.message,true);}
  }
});
function fillAnimeForm(id,a){$("animeId").value=id;$("title").value=a.title||"";$("description").value=a.description||"";$("genres").value=(a.genre||[]).join(", ");$("year").value=a.year||"";$("rating").value=a.rating||"";$("status").value=a.status||"Popular";$("posterUrl").value=a.posterUrl||"";$("bannerUrl").value=a.bannerUrl||"";$("audioLanguages").value=(a.audioLanguages||[]).join(", ");$("subtitleLanguages").value=(a.subtitleLanguages||[]).join(", ");$("rightsNote").value=a.rightsNote||"";$("saveAnime").textContent="Update anime";window.scrollTo({top:0,behavior:"smooth"});}
$("resetAnime").addEventListener("click",()=>{$("animeForm").reset();$("animeId").value="";$("saveAnime").textContent="Save anime";message("animeMessage","");});
$("animeForm").addEventListener("submit",async e=>{
  e.preventDefault();const payload={title:$("title").value.trim(),description:$("description").value.trim(),genre:splitList($("genres").value),year:Number($("year").value)||null,rating:Number($("rating").value)||null,status:$("status").value,posterUrl:$("posterUrl").value.trim(),bannerUrl:$("bannerUrl").value.trim(),audioLanguages:splitList($("audioLanguages").value),subtitleLanguages:splitList($("subtitleLanguages").value),rightsNote:$("rightsNote").value.trim(),updatedAt:serverTimestamp()};
  try{const id=$("animeId").value;if(id){await updateDoc(doc(db,"anime",id),payload);message("animeMessage","Anime updated successfully.");}else{payload.createdAt=serverTimestamp();const ref=await addDoc(collection(db,"anime"),payload);message("animeMessage",`Anime saved. Document ID: ${ref.id}`);}$("animeForm").reset();$("animeId").value="";$("saveAnime").textContent="Save anime";await loadCatalog();}
  catch(err){message("animeMessage",err.message,true);}
});
$("refreshCatalog").addEventListener("click",loadCatalog);
$("seasonForm").addEventListener("submit",async e=>{e.preventDefault();if(!selectedAnimeId){message("seasonMessage","Select an anime using its Seasons button first.",true);return;}try{const n=Number($("seasonNumber").value);await setDoc(doc(db,"anime",selectedAnimeId,"seasons",`season-${n}`),{seasonNumber:n,title:$("seasonTitle").value.trim()||`Season ${n}`,createdAt:serverTimestamp()});message("seasonMessage","Season saved.");await loadSeasons();}catch(err){message("seasonMessage",err.message,true);}});
async function loadSeasons(){if(!selectedAnimeId)return;try{const snap=await getDocs(query(collection(db,"anime",selectedAnimeId,"seasons"),orderBy("seasonNumber")));seasons=snap.docs.map(d=>({id:d.id,...d.data()}));$("episodeSeason").innerHTML='<option value="">Select season</option>'+seasons.map(s=>`<option value="${escapeHTML(s.id)}">${escapeHTML(s.title||`Season ${s.seasonNumber}`)}</option>`).join("");$("seasonList").innerHTML=seasons.length?seasons.map(s=>`<div class="season-row"><strong>${escapeHTML(s.title||`Season ${s.seasonNumber}`)}</strong><button class="mini" data-season="${escapeHTML(s.id)}">View episodes</button></div>`).join(""):'<p class="muted">No seasons yet.</p>';}catch(err){message("seasonMessage",err.message,true);}}
$("seasonList").addEventListener("click",async e=>{const b=e.target.closest("[data-season]");if(!b)return;try{const snap=await getDocs(query(collection(db,"anime",selectedAnimeId,"seasons",b.dataset.season,"episodes"),orderBy("episodeNumber")));const eps=snap.docs.map(d=>d.data());$("seasonList").innerHTML=`<button class="text-button" id="backSeasons">← Back to seasons</button>`+(eps.length?eps.map(ep=>`<div class="season-row"><span>EP ${escapeHTML(ep.episodeNumber)} · ${escapeHTML(ep.title||"Untitled")}</span></div>`).join(""):'<p class="muted">No episodes in this season yet.</p>');$("backSeasons").addEventListener("click",loadSeasons);}catch(err){message("seasonMessage",err.message,true);}});
$("episodeForm").addEventListener("submit",async e=>{e.preventDefault();if(!selectedAnimeId){message("episodeMessage","Select an anime first.",true);return;}const seasonId=$("episodeSeason").value;if(!seasonId){message("episodeMessage","Choose a season.",true);return;}try{const n=Number($("episodeNumber").value);await setDoc(doc(db,"anime",selectedAnimeId,"seasons",seasonId,"episodes",`episode-${n}`),{episodeNumber:n,title:$("episodeTitle").value.trim()||`Episode ${n}`,videoUrl:$("videoUrl").value.trim(),audioLanguages:splitList($("episodeAudio").value),subtitleLanguages:splitList($("episodeSubs").value),createdAt:serverTimestamp()});message("episodeMessage","Episode saved.");$("episodeForm").reset();await loadSeasons();}catch(err){message("episodeMessage",err.message,true);}});
