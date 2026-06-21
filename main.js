const form = document.querySelector("form");
const input = document.getElementById("name__city");

const city = document.getElementById("city");
const temp = document.getElementById("temp");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const desc = document.getElementById("desc");
const icon = document.getElementById("icon");
const toggle = document.getElementById("toggle");

const loading = document.getElementById("loading");
const error = document.getElementById("error");

const API_KEY = "d7ac7546e6c1e9461028ab775299a44b";

window.addEventListener("load", () => {
  callAPIWeather("Hanoi");
  renderHistory();
});

function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let nameCity = input.value.trim();

  if (!nameCity) {
    error.innerText = "Vui lòng nhập thành phố!";
    return;
  }

  let normalized = removeVietnameseTones(nameCity);

  callAPIWeather(normalized);
  input.value = "";
});

toggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    toggle.innerText = "☀️ Light";
  } else {
    toggle.innerText = "🌙 Dark";
  }
});

async function callAPIWeather(query) {
  try {
    error.innerText = "";
    loading.style.display = "block";

    let res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${API_KEY}&units=metric&lang=vi`,
    );

    let data = await res.json();

    loading.style.display = "none";

    if (data.cod === "404") {
      error.innerText = "Sai tên thành phố!";
      return;
    } else if (data.cod === "401") {
      error.innerText = "Sai API key!";
      return;
    }
    saveHistory(data.name);
    renderHistory();

    city.innerText = data.name;
    temp.innerText = Math.round(data.main.temp) + "°C";
    humidity.innerText = "Độ ẩm: " + data.main.humidity + "%";
    wind.innerText = "Gió: " + data.wind.speed + " m/s";
    desc.innerText = data.weather[0].description;

    icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    changeBackground(data.weather[0].main);
  } catch (err) {
    loading.style.display = "none";
    error.innerText = "Có lỗi xảy ra!";
    console.log(err);
  }
}

function changeBackground(weather) {
  if (weather === "Clear") {
    document.body.style.background =
      "linear-gradient(to right, #fceabb, #f8b500)";
  } else if (weather === "Clouds") {
    document.body.style.background =
      "linear-gradient(to right, #bdc3c7, #2c3e50)";
  } else if (weather === "Rain") {
    document.body.style.background =
      "linear-gradient(to right, #4b79a1, #283e51)";
  } else if (weather === "Thunderstorm") {
    document.body.style.background =
      "linear-gradient(to right, #141e30, #243b55)";
  } else {
    document.body.style.background =
      "linear-gradient(to right, #4facfe, #00f2fe)";
  }
}

function saveHistory(city) {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  let normalized = city.toLowerCase();

  history = history.filter((item) => item.toLowerCase() !== normalized);

  history.unshift(city);

  if (history.length > 5) {
    history.pop();
  }

  localStorage.setItem("history", JSON.stringify(history));
}

const historyList = document.getElementById("history");

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  historyList.innerHTML = "";

  history.forEach((city) => {
    let li = document.createElement("li");
    li.innerText = city;

    li.addEventListener("click", () => {
      callAPIWeather(city);
    });

    historyList.appendChild(li);
  });
}

const clearBtn = document.getElementById("clearHistory");

clearBtn.addEventListener("click", () => {
  if (confirm("Bạn có chắc muốn xoá lịch sử không?")) {
    localStorage.removeItem("history");
    renderHistory();
  }
});
