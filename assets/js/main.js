


const API_KEY = 'ecb57f4dfa148ed0ee15722655ab71a0';


const searchCityForm = document.querySelector('.search-city-form');
const cityNameInp = document.querySelector('.city-name-inp');
const cityNameSubmitBtn = document.querySelector('.city-name-submit-btn');
const resMsgWrapper = document.querySelector('.res-msg-wrapper');
const searchedCitiesList = document.querySelector('.searched-cities-list');
const mainContainerRightWrapper = document.querySelector('.main-container-right');
const todayWeatherWrapper = document.querySelector('.today-weather-wrapper');
const fiveDayForcastItems = document.querySelector('.five-day-forecast-items');

function kelvinToFahrenheit(valNum) {
  valNum = parseFloat(valNum);
  return ((valNum - 273.15) * 1.8) + 32;
}

function getForecastArr(data) {
  const forecastArr = [];

  data.list.forEach(function(listItem){
    const formattedDate = `${listItem.dt_txt.split(' ')[0].split('-')[1]}-${listItem.dt_txt.split(' ')[0].split('-')[2]}-${listItem.dt_txt.split(' ')[0].split('-')[0]}`;
    if(forecastArr.findIndex(el => el.formattedDate == formattedDate) == -1) {
      forecastArr.push({
        formattedDate: formattedDate,
        wind: listItem.wind.speed,
        temp: kelvinToFahrenheit(listItem.main.temp).toFixed(2),
        humidity: listItem.main.humidity,
        iconUrl: `https://openweathermap.org/img/wn/${listItem.weather[0].icon}.png`
      });
    }
  });

  return forecastArr;
}

function getWeatherForecast(cityName) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&APPID=${API_KEY}`;

  return new Promise(function(resolve, reject){
    fetch(url)
    .then(function(res){
      if(res.ok) return res.json();
      reject('Weather report unavailable for this city');
    })
    .then(function(data){
      resolve(data);
    })
    .catch(function(err){
      reject(err);
    });
  });
}

function renderSearchedCityWeatherForecast(e) {
  const cityName = e.target.getAttribute('data-q');
  cityNameInp.value = cityName;
  cityNameSubmitBtn.click();
}

function renderSearchedCities() {
  const searchedCitiesLs = JSON.parse(localStorage.getItem('searched-cities')) || [];
  searchedCitiesList.innerHTML = '';

  searchedCitiesLs.forEach(function(item){
    const li = document.createElement('li');
    li.className = 'searched-cities-item';
    li.setAttribute('data-q', item);
    li.innerText = item;
    searchedCitiesList.prepend(li);

    li.addEventListener('click', renderSearchedCityWeatherForecast);
  });
}

function saveSearchedCity(cityName) {
  const searchedCitiesLs = JSON.parse(localStorage.getItem('searched-cities')) || [];
  if(searchedCitiesLs.findIndex(el => el == cityName) != -1) return;
  searchedCitiesLs.push(cityName);
  localStorage.setItem('searched-cities', JSON.stringify(searchedCitiesLs));
  renderSearchedCities();
}

async function renderTodayWeather(e) {
  e.preventDefault();
  const cityName = cityNameInp.value;

  try {
    const data = await getWeatherForecast(cityName);
    const forecastArr = getForecastArr(data);
    saveSearchedCity(cityName);
    
    resMsgWrapper.innerText = '';
    todayWeatherWrapper.innerHTML = '';
    fiveDayForcastItems.innerHTML = '';
    mainContainerRightWrapper.classList.remove('d-none');

    todayWeatherWrapper.innerHTML = `
    <div class="today-weather-header">
      ${cityName} (${forecastArr[0].formattedDate})
      <img src="${forecastArr[0].iconUrl}"/> 
    </div>
    <div class="today-weather-body">
      Temp: ${forecastArr[0].temp}&deg; F <br/> 
      Wind: ${forecastArr[0].wind} MPH <br/>
      Humidity: ${forecastArr[0].humidity}% <br/>
    </div>
    `;

    forecastArr.slice(1).forEach(function(item){
      fiveDayForcastItems.innerHTML += `
      <li class="five-day-forecast-item">
        <div class="five-day-forecast-item-header">
          ${item.formattedDate}
          <img src="${item.iconUrl}"/> 
        </div>
        <div class="five-day-forecast-item-body">
          Temp: ${item.temp}&deg; F <br/> 
          Wind: ${item.wind} MPH <br/>
          Humidity: ${item.humidity}% <br/>
        </div>
      </li>
      `;
    });
  } catch (err) {
    resMsgWrapper.innerText = err;
  }
}

renderSearchedCities();
searchCityForm.addEventListener('submit', renderTodayWeather);
