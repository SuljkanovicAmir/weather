import moment from 'moment';



let search = document.querySelector('.searchCity')
let submitBtn = document.querySelector('.submitSearch')
let results = document.querySelector('.results')
let weeklyForecast = document.querySelector('.weeklyForecast')
let frame = document.querySelector('.frame')
let moon = document.querySelector('.moon')
let stars = document.querySelector('.stars')
let mainContainer = document.querySelector('.container')


document.addEventListener("DOMContentLoaded", ( async() => {
    const weatherData = await getData('Sarajevo')
    setResults(weatherData)
    const weeklyWeatherData = await getOneCallData(weatherData.longitude, weatherData.latitude)
    setWeeklyResults(weeklyWeatherData)
}))


submitBtn.addEventListener('click', async (e) => {
    e.preventDefault()
    if (search.value == '') {
        console.log('hi');
        return false 
      } else {
        const weatherData = await getData(search.value)
        setResults(weatherData)
        const weeklyWeatherData = await getOneCallData(weatherData.longitude, weatherData.latitude)
        setWeeklyResults(weeklyWeatherData)
      }
  
  })


function convertData(data) {
    const {
        name: cityName,
        weather: main,
        sys: country,
        main: {temp: temperature, feels_like: feelsLike, pressure, humidity},
        timezone: timezone,
        wind: {speed: windSpeed},
        coord: {lon: longitude, lat: latitude}
    } = data;
    return { cityName, temperature, feelsLike, main, timezone, country, pressure, humidity, windSpeed, longitude, latitude};
}



    async function getData(cityName) {
        try {
            results.innerHTML = '';
            search.value = '';
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=ea323c85ab2318ddfec06fad9a7c3ae6&units=metric`, { mode: "cors" })
            const data = convertData(await response.json())
            return data;
        } catch(err) {
            console.log(err)
            return null;
            }

          
        } 

        async function getOneCallData(longitude, latitude) {
            try {
                let response = await fetch(
                    `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=ea323c85ab2318ddfec06fad9a7c3ae6`
                  );
                const data = await response.json()
                return data;
               
            } catch(err) {
                console.log(err)
                return null;
                }
            } 
    



   async function setResults(weatherData) {
        if(!weatherData) return;

        const searchResult = document.querySelector(".results");
        searchResult.classList.add("active");
        const dateAndTime = await getLocalTime(weatherData.timezone);
        console.log(dateAndTime)

        
        const cityName = document.createElement('p')
        const time = document.createElement('p')
        const temperature = document.createElement('p')
        const feelsLike = document.createElement('p')
        const weather = document.createElement('p')
        const country = document.createElement('span')
        const humidityDiv = document.createElement('div')
        humidityDiv.classList.add('moreInfo')
        const humidity = document.createElement('div')
        const humidityText = document.createElement('div')

        const otherInfo = document.createElement('div')
        otherInfo.classList.add('otherInfo')

        const pressureDiv = document.createElement('div')
        pressureDiv.classList.add('moreInfo')
        const pressure = document.createElement('div')
        const pressureText = document.createElement('div')

        const windDiv = document.createElement('div')
        windDiv.classList.add('moreInfo')
        const wind = document.createElement('div')
        const windText = document.createElement('div')

        humidity.textContent = 'Humidity'
        humidityText.textContent = `${weatherData.humidity}%`
        humidityDiv.append(humidity, humidityText)
        otherInfo.appendChild(humidityDiv)

        pressure.textContent = 'Pressure'
        pressureText.textContent = `${weatherData.pressure}mb`
        pressureDiv.append(pressure, pressureText)
        otherInfo.appendChild(pressureDiv)

        wind.textContent = 'Wind'
        windText.textContent = `${weatherData.windSpeed}m/s`
        windDiv.append(wind, windText)
        otherInfo.appendChild(windDiv)



        cityName.textContent = `${weatherData.cityName},`
        cityName.classList.add('cityName')
        results.append(cityName)

        country.classList.add('country')
        country.textContent = `${weatherData.country.country}` 
        cityName.append(country) 

        time.textContent = `${dateAndTime}h`
        time.classList.add('time')
        results.append(time)
        

        weather.textContent = `${weatherData.main[0].main}`
        weather.classList.add('weather')
        results.append(weather)
        results.append(otherInfo)


        feelsLike.textContent = 'Feels like: ' + parseInt(`${weatherData.feelsLike}`) + '°C'
        feelsLike.classList.add('feelsLike')
        results.append(feelsLike)

        temperature.textContent = parseInt(`${weatherData.temperature}`) + '°C'
        temperature.classList.add('temperature')
        results.append(temperature)

        const hours = new Date().getHours()
        const isDayTime = hours > 6 && hours < 20
        if(isDayTime) {
            moon.style.display = 'none'
        } else {
            moon.style.display = 'flex'
            stars.style.display = 'block'
            mainContainer.style.background = 'linear-gradient(rgb(14 70 86), rgb(1 17 29))';
            
        }

        if(weatherData.main[0].main != 'Rain') {
            return
        } else {
            frame.style.display = 'flex'
        }  

        
        
        }

      
     
        



async function setWeeklyResults (weeklyWeatherData) {

    let otherDayForecast = '';
    weeklyWeatherData.daily.forEach((day, idx) => {
        let dayTemp = Math.round(day.temp.day)
        let nightTemp = Math.round(day.temp.night)
        const icon = day.weather[0].icon
        let source = `http://openweathermap.org/img/w/${icon}.png`;
       
        if (idx == 0) {
            otherDayForecast += `
            <div class="weather-forecast-item weather-today active">
            <div class="day">Today</div>
            <img class="temp weatherIcon" src=${source}>
            <div class="temp night">Night ${nightTemp}°C</div>
            <div class="temp">Day ${dayTemp}°C</div>
            </div>`;
        } else {
            otherDayForecast += `
                <div class="weather-forecast-item active">
                    <div class="day">${moment(day.dt * 1000).format("dddd")}</div>
                    <img class="temp weatherIcon" src=${source}>
                    <div class="temp night">Night : ${nightTemp}°C</div>
                    <div class="temp">Day : ${dayTemp}°C</div>
                </div>`;
        }
    })

    weeklyForecast.innerHTML = otherDayForecast;

    }



 async function getLocalTime(data) {
    let options = { hour: "2-digit", minute: "2-digit", hour12: false };
    let date = new Date();
    let time = date.getTime();
    let localOffset = date.getTimezoneOffset() * 60000;
    let utc = time + localOffset;
    let localTime = utc + 1000 * data;
    let localTimeDate = new Date(localTime);
    return localTimeDate.toLocaleString('en-GB', options);
  }




  