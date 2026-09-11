const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const STORAGE = 'sportsguessr-v1';
const sportNames = {basketball:'BASKETBALL',football:'FOOTBALL',soccer:'SOCCER',baseball:'BASEBALL'};
let state = {sport:null,target:null,guesses:[],start:0,timer:null,finished:false};
let stats = JSON.parse(localStorage.getItem(STORAGE)||'null') || {played:0,wins:0,streak:0,history:[]};

function show(id){$$('.view').forEach(v=>v.classList.remove('active')); $('#'+id).classList.add('active'); window.scrollTo({top:0,behavior:'smooth'});}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,'').replace(/\s+/g,' ').trim()}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}
function formatTime(ms){const sec=Math.floor(ms/1000),m=Math.floor(sec/60),s=sec%60;return `${m}:${String(s).padStart(2,'0')}`}
function saveStats(){localStorage.setItem(STORAGE,JSON.stringify(stats))}
function updateStatsUI(){
  $('#statPlayed').textContent=stats.played;$('#statWins').textContent=stats.wins;$('#statRate').textContent=stats.played?Math.round(stats.wins/stats.played*100)+'%':'0%';$('#statStreak').textContent=stats.streak;
  $('#history').innerHTML=stats.history.slice(0,15).map(x=>`<div class="history-item"><span>${x.sport} · ${x.name}</span><b>${x.win?'✓':'✕'} ${x.time}</b></div>`).join('') || '<div class="history-item"><span>No games yet</span><span>Play your first game.</span></div>';
}
function startGame(sport){
  state={sport,target:pick(SPORTS_PLAYERS[sport]),guesses:[],start:Date.now(),timer:null,finished:false};
  $('#gameSport').textContent=sportNames[sport]; $('#timer').textContent='0:00'; $('#teamHint').textContent='🔒 Locked'; $('#hintBanner').textContent='Guess the mystery player.';
  buildBoard();buildKeyboard();show('gameView');$('#guessInput').value='';$('#guessInput').focus();
  state.timer=setInterval(()=>$('#timer').textContent=formatTime(Date.now()-state.start),250);
}
function buildBoard(){
  const b=$('#guessBoard');b.innerHTML='';
  for(let i=0;i<10;i++){const row=document.createElement('div');row.className='guess-row';row.dataset.row=i;b.appendChild(row)}
}
function renderGuess(guess,rowIndex){
  const row=$$('.guess-row')[rowIndex];row.innerHTML='';const answer=normalize(state.target[0]);const g=normalize(guess);
  const a=[...answer],used=Array(a.length).fill(false),result=Array(g.length).fill('miss');
  for(let i=0;i<g.length;i++)if(a[i]===g[i]){result[i]='exact';used[i]=true}
  for(let i=0;i<g.length;i++)if(result[i]==='miss'){const j=a.findIndex((x,k)=>!used[k]&&x===g[i]);if(j>-1){result[i]='present';used[j]=true}}
  let gi=0;
  for(const ch of guess){const tile=document.createElement('div');tile.className='tile '+(ch===' '?'space':result[gi]||'miss');tile.textContent=ch===' '?'':ch;row.appendChild(tile);if(ch!==' ')gi++}
}
function buildKeyboard(){
  const kb=$('#keyboard');kb.innerHTML='';
  [...'QWERTYUIOPASDFGHJKLZXCVBNM'].forEach(c=>{const b=document.createElement('button');b.className='key';b.textContent=c;b.onclick=()=>{const input=$('#guessInput');input.value+=c.toLowerCase();input.focus()};kb.appendChild(b)});
  ['⌫','ENTER'].forEach(c=>{const b=document.createElement('button');b.className='key wide';b.textContent=c;b.onclick=()=>c==='ENTER'?submitGuess():$('#guessInput').value=$('#guessInput').value.slice(0,-1);kb.appendChild(b)});
}
function submitGuess(){
  if(state.finished)return;const raw=$('#guessInput').value.trim();if(!raw)return toast('Type a player name first.');
  const roster=SPORTS_PLAYERS[state.sport];const match=roster.find(p=>normalize(p[0])===normalize(raw));
  if(!match)return toast('That player is not in this sport roster.');
  if(state.guesses.some(g=>normalize(g)===normalize(match[0])))return toast('You already guessed that player.');
  const guess=match[0];state.guesses.push(guess);renderGuess(guess,state.guesses.length-1);$('#guessInput').value='';
  if(normalize(guess)===normalize(state.target[0])) finish(true); else if(state.guesses.length>=5){$('#teamHint').textContent='🏷️ '+state.target[1];$('#hintBanner').textContent='Team hint unlocked: '+state.target[1]+' — keep going!'}
  if(state.guesses.length>=10 && !state.finished)finish(false);
}
function finish(win){state.finished=true;clearInterval(state.timer);const elapsed=Date.now()-state.start;stats.played++;if(win){stats.wins++;stats.streak++}else stats.streak=0;stats.history.unshift({sport:sportNames[state.sport],name:state.target[0],time:formatTime(elapsed),win});stats.history=stats.history.slice(0,30);saveStats();$('#resultEmoji').textContent=win?'🏆':'🫡';$('#resultKicker').textContent=win?'NICE WORK':'GAME OVER';$('#resultTitle').textContent=win?'You got it!':'The player was';$('#resultName').textContent=state.target[0];$('#resultTime').textContent=formatTime(elapsed);$('#resultGuesses').textContent=`${state.guesses.length} / 10`;$('#resultSport').textContent=sportNames[state.sport];show('resultView')}
function suggestions(){
  const q=normalize($('#guessInput').value);const box=$('#autocomplete');if(!q){box.innerHTML='';return}const list=SPORTS_PLAYERS[state.sport].filter(p=>normalize(p[0]).includes(q)).slice(0,6);if(!list.length){box.innerHTML='';return}box.innerHTML='<div class="suggestions">'+list.map(p=>`<button type="button" data-name="${p[0].replace(/"/g,'&quot;')}">${p[0]} <span style="color:#66758b">· ${p[1]}</span></button>`).join('')+'</div>';box.querySelectorAll('button').forEach(b=>b.onclick=()=>{$('#guessInput').value=b.dataset.name;box.innerHTML='';$('#guessInput').focus()})}
$$('.sport-card').forEach(b=>b.onclick=()=>startGame(b.dataset.sport));$('#guessBtn').onclick=submitGuess;$('#guessInput').addEventListener('input',suggestions);$('#guessInput').addEventListener('keydown',e=>{if(e.key==='Enter')submitGuess()});$('#brandHome').onclick=()=>show('menuView');$('#backMenu').onclick=()=>{clearInterval(state.timer);show('menuView')};$('#newGameBtn').onclick=()=>startGame(state.sport);$('#resultMenuBtn').onclick=()=>show('menuView');$('#statsBtn').onclick=()=>{updateStatsUI();show('statsView')};$('#statsBack').onclick=()=>show('menuView');$('#helpBtn').onclick=()=>show('helpView');$('#helpBack').onclick=()=>show('menuView');$('#shareBtn').onclick=async()=>{const text=`SportsGuessr ${sportNames[state.sport]} — ${state.guesses.length}/10 guesses — ${$('#resultTime').textContent}`;try{await navigator.clipboard.writeText(text);toast('Result copied!')}catch{toast(text)}};
document.addEventListener('keydown',e=>{if($('#gameView').classList.contains('active')&&e.key==='Escape'){$('#backMenu').click()}});
updateStatsUI();
