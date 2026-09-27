const KEY = 'logitrack-demo-v1';
const defaultData = [
  {id:101, client:'Альфа Трейд', route:'Москва → Казань', cargo:'Паллеты, 1200 кг', cost:58000, status:'route'},
  {id:102, client:'Вектор', route:'Ростов-на-Дону → Ставрополь', cargo:'Короба, 640 кг', cost:27000, status:'new'},
  {id:103, client:'Орион', route:'Краснодар → Волгоград', cargo:'Оборудование, 980 кг', cost:46500, status:'done'}
];

const labels = {new:'Новая', route:'В рейсе', done:'Доставлено'};
let shipments = load();

const rows = document.querySelector('#rows');
const stats = document.querySelector('#stats');
const search = document.querySelector('#search');
const filter = document.querySelector('#statusFilter');
const dialog = document.querySelector('#dialog');
const form = document.querySelector('#shipmentForm');

function load(){
  try { return JSON.parse(localStorage.getItem(KEY)) || structuredClone(defaultData); }
  catch { return structuredClone(defaultData); }
}
function save(){ localStorage.setItem(KEY, JSON.stringify(shipments)); }
function money(v){ return new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(v); }

function renderStats(){
  const total = shipments.length;
  const inRoute = shipments.filter(x=>x.status==='route').length;
  const done = shipments.filter(x=>x.status==='done').length;
  const sum = shipments.reduce((a,b)=>a+b.cost,0);
  stats.innerHTML = [
    ['Всего заявок', total],
    ['В рейсе', inRoute],
    ['Доставлено', done],
    ['Сумма заявок', money(sum)]
  ].map(([k,v])=>`<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');
}

function render(){
  const q = search.value.trim().toLowerCase();
  const status = filter.value;
  const data = shipments.filter(s =>
    (status==='all' || s.status===status) &&
    (`${s.client} ${s.route}`.toLowerCase().includes(q))
  );

  rows.innerHTML = data.map(s=>`
    <tr>
      <td>${s.id}</td><td>${s.client}</td><td>${s.route}</td><td>${s.cargo}</td>
      <td>${money(s.cost)}</td>
      <td><span class="pill ${s.status}">${labels[s.status]}</span></td>
      <td class="rowActions">
        <button data-action="next" data-id="${s.id}">Статус</button>
        <button data-action="delete" data-id="${s.id}">Удалить</button>
      </td>
    </tr>`).join('');
  document.querySelector('#empty').hidden = data.length !== 0;
  renderStats();
}

rows.addEventListener('click', e=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = Number(btn.dataset.id);
  const item = shipments.find(x=>x.id===id);
  if(btn.dataset.action==='delete') shipments = shipments.filter(x=>x.id!==id);
  if(btn.dataset.action==='next' && item){
    item.status = item.status==='new' ? 'route' : item.status==='route' ? 'done' : 'new';
  }
  save(); render();
});

document.querySelector('#addBtn').onclick = ()=>dialog.showModal();
document.querySelector('#cancelBtn').onclick = ()=>dialog.close();
document.querySelector('#seedBtn').onclick = ()=>{
  shipments = structuredClone(defaultData); save(); render();
};
search.addEventListener('input', render);
filter.addEventListener('change', render);

form.addEventListener('submit', e=>{
  e.preventDefault();
  shipments.unshift({
    id: Math.max(100,...shipments.map(x=>x.id))+1,
    client: document.querySelector('#client').value.trim(),
    route: document.querySelector('#route').value.trim(),
    cargo: document.querySelector('#cargo').value.trim(),
    cost: Number(document.querySelector('#cost').value),
    status:'new'
  });
  save(); form.reset(); dialog.close(); render();
});

render();
