const form = document.querySelector('#calcForm');
const price = document.querySelector('#price');
const details = document.querySelector('#details');

const money = value => new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency: 'RUB', maximumFractionDigits: 0
}).format(value);

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const distance = Number(document.querySelector('#distance').value);
  const weight = Number(document.querySelector('#weight').value);
  const rate = Number(document.querySelector('#rate').value);
  const multiplier = Number(document.querySelector('#deliveryType').value);
  const insurance = document.querySelector('#insurance').checked;

  if (distance <= 0 || weight <= 0 || rate <= 0) {
    price.textContent = 'Ошибка';
    details.textContent = 'Все числовые значения должны быть больше нуля.';
    return;
  }

  let total = distance * rate * multiplier;

  // Небольшая надбавка за массу свыше 1,5 т — демонстрационная бизнес-логика.
  if (weight > 1500) total *= 1.08;
  if (insurance) total *= 1.012;

  price.textContent = money(total);
  details.textContent =
    `${distance.toLocaleString('ru-RU')} км · ${weight.toLocaleString('ru-RU')} кг · ${rate} ₽/км` +
    (insurance ? ' · со страхованием' : '');
});

form.requestSubmit();
