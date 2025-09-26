const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeatherDiv = document.querySelector(
  ".hourly-weather .weather-list"
);

const API_KEY = "4b397b8fb25b41adb4b41832251809";

//Function to get weather details
const displayHourlyForcast = (hourlyData) => {
  const currentHour = new Date().setMinutes(0, 0, 0);
  const next24Hours = currentHour + 24 * 60 * 60 * 1000;

  const next24HoursData = hourlyData.filter(({ time }) => {
    const forecastTime = new Date(time).getTime();
    return forecastTime >= currentHour && forecastTime <= next24Hours;
  });

  //Generate HTML data to only include the next 24 hours
  hourlyWeatherDiv.innerHTML = next24HoursData
    .map((item) => {
      const temperature = Math.floor(item.temp_c);
      const time = item.time;
      const icon = item.condition.icon;
      console.log(icon);
      return `<li class="weather-item">
              <p class="time">${time.split(" ")[1].substring(0, 5)}</p>
              <img src="${icon}"class="weather-icon">
              <p class="temperature">${temperature}°C</p>
            </li>`;
    })
    .join("");
};

const getWeatherDetails = async (API_URL) => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    //Extract current weather details
    const temperature = Math.floor(data.current.temp_c);
    const description = data.current.condition.text;
    const icon = data.current.condition.icon;

    //Update the current weather display
    currentWeatherDiv.querySelector(
      ".temperature"
    ).innerHTML = `${temperature} <span>°C</span>`;
    currentWeatherDiv.querySelector(".description").innerText = description;
    currentWeatherDiv.querySelector(".weather-icon").src = `${icon}`;

    //Combine hourly data from today and tommorrow
    const combinedHourlyData = [
      ...data.forecast.forecastday[0].hour,
      ...data.forecast.forecastday[1].hour,
    ];

    displayHourlyForcast(combinedHourlyData);

    searchInput.value = data.location.name;
  } catch (error) {
    console.log("Invalid city name.");
  }
};

//Set up weather request for a spectific city
const setupWeatherRequest = (cityName) => {
  const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;
  getWeatherDetails(API_URL);
};

searchInput.addEventListener("keyup", (e) => {
  const cityName = searchInput.value.trim();

  if (e.key == "Enter" && cityName) {
    setupWeatherRequest(cityName);
  }
});

locationButton.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
      getWeatherDetails(API_URL);
    }, error => {
      alert(
        "Location access denied. Please enable premissions to use this feature."
      );
    }
  );
});