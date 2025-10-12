// script.js (до добавления PWA и мультивыбора; одна публикация на карточку)
const cardsContainer = document.getElementById("cardsContainer");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const form = document.getElementById("cardForm");
const createBtn = document.getElementById("createCard");
const cancelBtn = document.getElementById("cancel");

const publications = [
  "Рабочая тетрадь",
  "Сторожевая башня",
  "Сторожевая башня (крупный шрифт)",
  "Ежедневник",
  "Ежедневник (крупный шрифт)"
];

const months = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
];

const years = [2025, 2026, 2027, 2028, 2029, 2030];
let cards = JSON.parse(localStorage.getItem("cards")) || [];
let editIndex = null;

// Заполняем списки фильтров и формы
function populateSelects() {
  const yearSel = document.getElementById("year");
  const monthSel = document.getElementById("month");
  const pubSel = document.getElementById("publication");
  const fYear = document.getElementById("filterYear");
  const fMonth = document.getElementById("filterMonth");
  const fPub = document.getElementById("filterPublication");

  years.forEach(y => {
    yearSel.innerHTML += `<option value="${y}">${y}</option>`;
    fYear.innerHTML += `<option value="${y}">${y}</option>`;
  });

  months.forEach(m => {
    monthSel.innerHTML += `<option value="${m}">${m}</option>`;
    fMonth.innerHTML += `<option value="${m}">${m}</option>`;
  });

  publications.forEach(p => {
    pubSel.innerHTML += `<option value="${p}">${p}</option>`;
    fPub.innerHTML += `<option value="${p}">${p}</option>`;
  });

  // Устанавливаем текущие дату и месяц
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = months[now.getMonth()];
  if (years.includes(curYear)) yearSel.value = curYear;
  monthSel.value = curMonth;
}
populateSelects();

function saveCards() {
  localStorage.setItem("cards", JSON.stringify(cards));
}

function renderCards() {
  cardsContainer.innerHTML = "";
  const fy = document.getElementById("filterYear").value;
  const fm = document.getElementById("filterMonth").value;
  const fp = document.getElementById("filterPublication").value;
  const fs = document.getElementById("filterStatus").value;

  cards
    .filter(c =>
      (fy === "all" || c.year == fy) &&
      (fm === "all" || c.month === fm) &&
      (fp === "all" || c.publication === fp) &&
      (fs === "all" || c.status === fs)
    )
    .forEach((card, i) => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <h3>${card.publication}</h3>
        <p><b>Год:</b> ${card.year}</p>
        <p><b>Месяц:</b> ${card.month}</p>
        <p><b>Имя:</b> ${card.name}</p>
        <p><b>Статус:</b> ${card.status}</p>
        <div class="actions">
          <button onclick="editCard(${i})">✏️</button>
          <button onclick="deleteCard(${i})">🗑️</button>
        </div>
      `;
      cardsContainer.appendChild(div);
    });
}

createBtn.onclick = () => {
  modalTitle.textContent = "Создать карточку";
  form.reset();
  populateSelects();
  editIndex = null;
  modal.classList.remove("hidden");
};

cancelBtn.onclick = () => modal.classList.add("hidden");

form.onsubmit = (e) => {
  e.preventDefault();
  const newCard = {
    year: form.year.value,
    month: form.month.value,
    publication: form.publication.value,
    name: form.name.value.trim(),
    status: form.status.value
  };

  if (editIndex !== null) {
    cards[editIndex] = newCard;
  } else {
    cards.push(newCard);
  }

  saveCards();
  renderCards();
  modal.classList.add("hidden");
};

function editCard(i) {
  const c = cards[i];
  modalTitle.textContent = "Редактировать карточку";
  form.year.value = c.year;
  form.month.value = c.month;
  form.publication.value = c.publication;
  form.name.value = c.name;
  form.status.value = c.status;
  editIndex = i;
  modal.classList.remove("hidden");
}

function deleteCard(i) {
  if (confirm("Удалить карточку?")) {
    cards.splice(i, 1);
    saveCards();
    renderCards();
  }
}

document.querySelectorAll(".filters select")
  .forEach(f => f.addEventListener("change", renderCards));

renderCards();
