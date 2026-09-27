const KEY = 'freight-manager-demo-v1';

const demoOrders = [
  {id:201, client:'Север Трейд', route:'Москва → Тула', distance:190, weight:820, cost:7980, status:'done'},
  {id:202, client:'ЮгСнаб', route:'Ростов-на-Дону → Ставрополь', distance:340, weight:1450, cost:16422, status:'route'},
  {id:203, client:'Вектор', route:'Краснодар → Волгоград', distance:740, weight:2100, cost:36278, status:'planned'},
  {id:204, client:'Орион', route:'Казань → Самара', distance:360, weight:900, cost:15120, status:'new'}
];

const labels = {
  new:'Новая',
  planned:'Запланирована',
  route:'В рейсе',
  done:'Доставлено'
};

let orders = load();

const form = document.querySelector('#orderForm');
const rows = document.querySelector('#rows');
const summary = document.querySelector('#summary');
const search = document.querySelector('#search');
const statusFilter = document.querySelector('#statusFilter');
const sort = document.querySelector('#sort');

function cloneDemo(){
  return JSON.parse(JSON.stringify(demoOrders));
}

function load(){
  try {
    return JSON.parse(localStorage.getItem(KEY)) || cloneDemo();
  } catch {
    return cloneDemo();
  }
}

function save(){
  localStorage.setItem(KEY, JSON.stringify(orders));
}

function money(value){
  return new Intl.NumberFormat('ru-RU',{
    style:'currency',
    currency:'RUB',
    maximumFractionDigits:0
  }).format(value);
}

function calculate(){
  const distance = Number(document.querySelector('#distance').value);
  const weight = Number(document.querySelector('#weight').value);
  const rate = Number(document.querySelector('#rate').value);
  const priority = Number(document.querySelector('#priority').value);
  const insurance = document.querySelector('#insurance').checked;

  if (distance <= 0 || weight <= 0 || rate <= 0) return 0;

  let total = distance * rate * priority;

  if (weight > 1500) total *= 1.08;
  if (weight > 3000) total *= 1.05;
  if (insurance) total *= 1.012;

  return Math.round(total);
}

function updateEstimate(){
  const value = calculate();
  document.querySelector('#estimate').textContent = value ? money(value) : '—';
}

function renderSummary(){
  const total = orders.length;
  const active = orders.filter(o => ['planned','route'].includes(o.status)).length;
  const done = orders.filter(o => o.status === 'done').length;
  const revenue = orders.reduce((sum,o) => sum + o.cost, 0);

  summary.innerHTML = [
    ['Всего заявок', total],
    ['Активные', active],
    ['Доставлено', done],
    ['Сумма заявок', money(revenue)]
  ].map(([label,value]) =>
    `<article class="stat"><span>${label}</span><strong>${value}</strong></article>`
  ).join('');
}

function getVisibleOrders(){
  const q = search.value.trim().toLowerCase();
  const status = statusFilter.value;

  let data = orders.filter(o =>
    (status === 'all' || o.status === status) &&
    (`${o.client} ${o.route}`.toLowerCase().includes(q))
  );

  if (sort.value === 'costDesc') data.sort((a,b) => b.cost - a.cost);
  if (sort.value === 'costAsc') data.sort((a,b) => a.cost - b.cost);
  if (sort.value === 'distanceDesc') data.sort((a,b) => b.distance - a.distance);
  if (sort.value === 'newest') data.sort((a,b) => b.id - a.id);

  return data;
}

function render(){
  const data = getVisibleOrders();

  rows.innerHTML = data.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.client}</td>
      <td>${o.route}</td>
      <td>${o.distance.toLocaleString('ru-RU')}</td>
      <td>${o.weight.toLocaleString('ru-RU')} кг</td>
      <td>${money(o.cost)}</td>
      <td><span class="pill ${o.status}">${labels[o.status]}</span></td>
      <td class="actions">
        <button data-action="next" data-id="${o.id}">Статус</button>
        <button data-action="delete" data-id="${o.id}">Удалить</button>
      </td>
    </tr>
  `).join('');

  document.querySelector('#empty').hidden = data.length !== 0;
  renderSummary();
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const cost = calculate();
  if (!cost) return;

  orders.unshift({
    id: Math.max(200, ...orders.map(o => o.id)) + 1,
    client: document.querySelector('#client').value.trim(),
    route: document.querySelector('#route').value.trim(),
    distance: Number(document.querySelector('#distance').value),
    weight: Number(document.querySelector('#weight').value),
    cost,
    status:'new'
  });

  save();
  form.reset();
  document.querySelector('#distance').value = 500;
  document.querySelector('#weight').value = 1000;
  document.querySelector('#rate').value = 42;
  updateEstimate();
  render();
});

['distance','weight','rate','priority','insurance'].forEach(id => {
  document.querySelector(`#${id}`).addEventListener('input', updateEstimate);
  document.querySelector(`#${id}`).addEventListener('change', updateEstimate);
});

rows.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = Number(button.dataset.id);
  const order = orders.find(o => o.id === id);

  if (button.dataset.action === 'delete') {
    orders = orders.filter(o => o.id !== id);
  }

  if (button.dataset.action === 'next' && order) {
    const flow = ['new','planned','route','done'];
    order.status = flow[(flow.indexOf(order.status) + 1) % flow.length];
  }

  save();
  render();
});

search.addEventListener('input', render);
statusFilter.addEventListener('change', render);
sort.addEventListener('change', render);

document.querySelector('#resetBtn').addEventListener('click', () => {
  orders = cloneDemo();
  save();
  render();
});

updateEstimate();
render();
