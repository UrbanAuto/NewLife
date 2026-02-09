const SERVICE_FEE = 500;
const BEP_FEE = 650;
const COMPLEX_BY_CITY = {
  lviv: 1050,
  kyiv: 1250,
};

const logisticsByAuctionRaw = {
  copart: window.COPART_LOGISTICS || {},
  iaai: window.IAAI_LOGISTICS || {},
  manheim: window.MANHEIM_LOGISTICS || {},
};

let euroToUsd = 1.04;

const auctionFeeRules = {
  copart: [
    { max: 199.99, fee: 205 },
    { max: 299.99, fee: 240 },
    { max: 349.99, fee: 265 },
    { max: 399.99, fee: 280 },
    { max: 449.99, fee: 305 },
    { max: 499.99, fee: 315 },
    { max: 549.99, fee: 340 },
    { max: 599.99, fee: 350 },
    { max: 699.99, fee: 420 },
    { max: 799.99, fee: 445 },
    { max: 899.99, fee: 465 },
    { max: 999.99, fee: 480 },
    { max: 1199.99, fee: 520 },
    { max: 1299.99, fee: 540 },
    { max: 1399.99, fee: 555 },
    { max: 1499.99, fee: 570 },
    { max: 1599.99, fee: 595 },
    { max: 1699.99, fee: 610 },
    { max: 1799.99, fee: 630 },
    { max: 1999.99, fee: 700 },
    { max: 2399.99, fee: 685 },
    { max: 2499.99, fee: 720 },
    { max: 2999.99, fee: 755 },
    { max: 3499.99, fee: 800 },
    { max: 3999.99, fee: 850 },
    { max: 4499.99, fee: 910 },
    { max: 4999.99, fee: 935 },
    { max: 5499.99, fee: 960 },
    { max: 5999.99, fee: 960 },
    { max: 6499.99, fee: 985 },
    { max: 6999.99, fee: 985 },
    { max: 7499.99, fee: 1050 },
    { max: 7999.99, fee: 1050 },
    { max: 8499.99, fee: 1105 },
    { max: 8999.99, fee: 1105 },
    { max: 9999.99, fee: 1105 },
    { max: 10499.99, fee: 1195 },
    { max: 10999.99, fee: 1195 },
    { max: 11499.99, fee: 1195 },
    { max: 11999.99, fee: 1195 },
    { max: 12499.99, fee: 1205 },
    { max: 14999.99, fee: 1220 },
    { max: Infinity, fee: (price) => Math.round(price * 0.06 + 345) },
  ],
  iaai: [
    { max: 199.99, fee: 260 },
    { max: 299.99, fee: 295 },
    { max: 349.99, fee: 320 },
    { max: 399.99, fee: 335 },
    { max: 449.99, fee: 360 },
    { max: 499.99, fee: 370 },
    { max: 549.99, fee: 395 },
    { max: 599.99, fee: 405 },
    { max: 699.99, fee: 405 },
    { max: 799.99, fee: 430 },
    { max: 899.99, fee: 450 },
    { max: 999.99, fee: 465 },
    { max: 1199.99, fee: 505 },
    { max: 1299.99, fee: 525 },
    { max: 1399.99, fee: 540 },
    { max: 1499.99, fee: 555 },
    { max: 1599.99, fee: 580 },
    { max: 1699.99, fee: 595 },
    { max: 1799.99, fee: 615 },
    { max: 1999.99, fee: 635 },
    { max: 2399.99, fee: 670 },
    { max: 2499.99, fee: 705 },
    { max: 2999.99, fee: 740 },
    { max: 3499.99, fee: 785 },
    { max: 3999.99, fee: 835 },
    { max: 4499.99, fee: 895 },
    { max: 4999.99, fee: 920 },
    { max: 5499.99, fee: 970 },
    { max: 5999.99, fee: 970 },
    { max: 6499.99, fee: 1035 },
    { max: 6999.99, fee: 1035 },
    { max: 7499.99, fee: 1090 },
    { max: 7999.99, fee: 1090 },
    { max: 8499.99, fee: 1150 },
    { max: 9999.99, fee: 1150 },
    { max: 11499.99, fee: 1180 },
    { max: 11999.99, fee: 1190 },
    { max: 12499.99, fee: 1205 },
    { max: 14999.99, fee: 1220 },
    { max: Infinity, fee: (price) => Math.round(price * 0.06 + 345) },
  ],
};

const moneyFmt = new Intl.NumberFormat('uk-UA', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const usdFmt = new Intl.NumberFormat('uk-UA', {
  maximumFractionDigits: 0,
});

const ids = [
  'carPrice',
  'repairCost',
  'auctionType',
  'siteName',
  'engineType',
  'carAge',
  'engineVolume',
  'batteryKwh',
  'destinationCity',
  'hazardousCargo',
];

const elements = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const resultRows = document.getElementById('resultRows');
const totalPrice = document.getElementById('totalPrice');
const dutyValue = document.getElementById('dutyValue');
const vatValue = document.getElementById('vatValue');
const exciseValue = document.getElementById('exciseValue');
const customsTotalValue = document.getElementById('customsTotalValue');
const hazardousRow = document.getElementById('hazardousRow');
const batteryRow = document.getElementById('batteryRow');
const engineVolumeRow = document.getElementById('engineVolumeRow');
const siteOptions = document.getElementById('siteOptions');
const themeButtons = document.querySelectorAll('.theme-btn');

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function formatUsd(value) {
  return `${usdFmt.format(Math.round(value))} USD`;
}

function normalizeSiteName(name) {
  return String(name || '').trim().toLowerCase();
}

function toNormalizedMap(base) {
  const out = {};
  Object.entries(base || {}).forEach(([site, value]) => {
    out[normalizeSiteName(site)] = num(value);
  });
  return out;
}

const logisticsByAuction = {
  copart: toNormalizedMap(logisticsByAuctionRaw.copart),
  iaai: toNormalizedMap(logisticsByAuctionRaw.iaai),
  manheim: toNormalizedMap(logisticsByAuctionRaw.manheim),
};

function getAuctionFee(auction, price) {
  if (auction === 'manheim') {
    // In source calc, Manheim fee is Copart fee with permanent -$40 adjustment.
    return Math.max(0, getAuctionFee('copart', price) - 40);
  }
  const rules = auctionFeeRules[auction] || [];
  const found = rules.find((rule) => price <= rule.max);
  if (!found) return 0;
  return typeof found.fee === 'function' ? found.fee(price) : found.fee;
}

function getFreight(auctionType, siteName) {
  const site = normalizeSiteName(siteName);
  return logisticsByAuction[auctionType]?.[site] || 0;
}

function getExcise(engineType, engineVolumeCm3, carAgeYears) {
  const volumeLiters = num(engineVolumeCm3) / 1000;
  const age = Math.max(1, num(carAgeYears));

  let acciseEur = 0;

  if (engineType === 'diesel') {
    acciseEur = 75 * volumeLiters;
    acciseEur *= volumeLiters > 3.5 ? 2 : 1;
    acciseEur *= age;
  } else if (engineType === 'petrol' || engineType === 'hybrid') {
    acciseEur = 50 * volumeLiters;
    acciseEur *= volumeLiters > 3 ? 2 : 1;
    acciseEur *= age;
  } else {
    return 0;
  }

  return acciseEur * euroToUsd;
}

function getAgeCoefficientFromYear(selectedYear) {
  const year = Number(selectedYear);
  if (!Number.isFinite(year)) return 1;
  if (year >= 2024) return 1;
  if (year <= 2010) return 15;
  return 2025 - year;
}

async function fetchExchangeRates() {
  try {
    const response = await fetch('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    const usd = data.find((x) => x.txt === 'Долар США');
    const eur = data.find((x) => x.txt === 'Євро');
    if (usd?.rate && eur?.rate) {
      euroToUsd = eur.rate / usd.rate;
      calculate();
    }
  } catch {
    // Keep fallback rate.
  }
}

function calculate() {
  const carPrice = num(elements.carPrice.value);
  const repairCost = num(elements.repairCost.value);
  const auctionType = elements.auctionType.value;
  const siteName = elements.siteName.value;
  const engineType = elements.engineType.value;
  const carYear = num(elements.carAge.value);
  const engineVolume = num(elements.engineVolume.value);
  const batteryKwh = num(elements.batteryKwh.value);
  const destination = elements.destinationCity.value;

  const auctionFee = getAuctionFee(auctionType, carPrice);
  const freight = getFreight(auctionType, siteName);

  const swift = (carPrice + auctionFee) * 0.025 + 100;
  const insurance = carPrice * 0.01 + 150;
  const serviceFee = SERVICE_FEE;
  const bePFee = BEP_FEE;
  const complex = COMPLEX_BY_CITY[destination] || 0;

  const isElectric = engineType === 'electric';
  const dangerousCargo = isElectric ? num(elements.hazardousCargo.value) : 0;

  const carPriceAndAuction = carPrice + auctionFee;
  const customsValue = carPrice + auctionFee + 1800;

  const ageCoeff = getAgeCoefficientFromYear(carYear);
  let excise = getExcise(engineType, engineVolume, ageCoeff);
  let totalCustoms = 0;

  let duty = 0;
  let vat = 0;

  if (isElectric) {
    // Electric customs formula requested by user:
    // customs_value = car_price + auction_fee + 1800
    // excise = battery_kwh * euro_rate
    // vat = (customs_value + excise) * 0.20
    // total_customs = excise + vat
    excise = batteryKwh * euroToUsd;
    vat = (customsValue + excise) * 0.2;
    totalCustoms = excise + vat;
  } else {
    duty = (carPriceAndAuction + 1800) * 0.1;
    vat = (carPriceAndAuction + duty + excise + 1800) * 0.2;
    totalCustoms = duty + excise + vat;
  }

  const total =
    carPrice +
    repairCost +
    freight +
    swift +
    insurance +
    serviceFee +
    bePFee +
    complex +
    dangerousCargo +
    auctionFee +
    duty +
    vat +
    excise;

  const rows = [
    { label: 'ФРАХТ', value: freight, compact: false },
    { label: 'SWIFT', value: swift, compact: true },
    { label: 'Страхування', value: insurance, compact: true },
    { label: 'Аукціонний збір', value: auctionFee, compact: true },
    { label: 'Небезпечний вантаж', value: dangerousCargo, compact: true },
    { label: 'БЕП', value: bePFee, compact: true },
    { label: 'Комплекс', value: complex, compact: true },
    { label: 'Послуга', value: serviceFee, compact: false },
  ];

  resultRows.innerHTML = rows
    .map(
      (item) => `
        <div class="row ${item.compact ? 'row--compact' : 'row--full'}">
          <span class="label">${item.label}</span>
          <span class="value">${formatUsd(item.value)}</span>
        </div>`
    )
    .join('');

  dutyValue.textContent = formatUsd(duty);
  vatValue.textContent = formatUsd(vat);
  exciseValue.textContent = formatUsd(excise);
  customsTotalValue.textContent = formatUsd(totalCustoms);
  totalPrice.textContent = moneyFmt.format(total);
}

function syncElectricFields() {
  const isElectric = elements.engineType.value === 'electric';
  hazardousRow.classList.toggle('hidden', !isElectric);
  batteryRow.classList.toggle('hidden', !isElectric);
  engineVolumeRow.classList.toggle('hidden', isElectric);
  elements.engineVolume.disabled = isElectric;
  elements.batteryKwh.disabled = !isElectric;
  if (isElectric) {
    elements.engineVolume.value = 0;
  }
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  themeButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.theme === theme);
  });
}

function fillSiteOptions() {
  const auctionType = elements.auctionType.value;
  const siteNames = Object.keys(logisticsByAuctionRaw[auctionType] || {}).sort((a, b) =>
    a.localeCompare(b, 'uk-UA')
  );
  siteOptions.innerHTML = siteNames.map((name) => `<option value="${name}"></option>`).join('');
}

function fillYearOptions() {
  const options = [
    '<option value="2026">2026</option>',
    '<option value="2025">2025</option>',
    '<option value="2024">2024</option>',
    '<option value="2023">2023</option>',
    '<option value="2022">2022</option>',
    '<option value="2021">2021</option>',
    '<option value="2020">2020</option>',
    '<option value="2019">2019</option>',
    '<option value="2018">2018</option>',
    '<option value="2017">2017</option>',
    '<option value="2016">2016</option>',
    '<option value="2015">2015</option>',
    '<option value="2014">2014</option>',
    '<option value="2013">2013</option>',
    '<option value="2012">2012</option>',
    '<option value="2011">2011</option>',
    '<option value="2010">2010</option>',
    '<option value="2009">2009</option>',
    '<option value="2008">2008</option>',
    '<option value="2007">2007 і старше</option>',
  ];
  elements.carAge.innerHTML = options.join('');
  elements.carAge.value = '2026';
}

ids.forEach((id) => {
  elements[id].addEventListener('input', () => {
    if (id === 'engineType') {
      syncElectricFields();
    }
    if (id === 'auctionType') {
      fillSiteOptions();
    }
    calculate();
  });
  elements[id].addEventListener('change', () => {
    if (id === 'engineType') {
      syncElectricFields();
    }
    if (id === 'auctionType') {
      fillSiteOptions();
    }
    calculate();
  });
});

themeButtons.forEach((btn) => {
  btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});

syncElectricFields();
fillSiteOptions();
fillYearOptions();
calculate();
fetchExchangeRates();
