// Live weather for Toukley, NSW (where Beachcomber Hotel & Resort is).
// Uses Open-Meteo (no auth, free, CORS-enabled).

export type WeatherCondition = "sunny" | "cloudy" | "rain" | "night";

export type LiveWeather = {
  tempC: number;
  label: string;
  condition: WeatherCondition;
};

const TOUKLEY_LAT = -33.272;
const TOUKLEY_LON = 151.541;

export const fallbackWeather: LiveWeather = {
  tempC: 22,
  label: "Sunny",
  condition: "sunny",
};

export async function fetchToukleyWeather(): Promise<LiveWeather> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${TOUKLEY_LAT}&longitude=${TOUKLEY_LON}` +
    `&current=temperature_2m,weather_code,is_day` +
    `&timezone=Australia/Sydney`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("weather fetch failed");
  const data = await res.json();
  const current = data.current ?? {};

  const code = Number(current.weather_code ?? 0);
  const tempC = Math.round(Number(current.temperature_2m ?? 0));
  const isDay = Number(current.is_day ?? 1) === 1;

  return {
    tempC,
    label: weatherLabel(code, isDay),
    condition: weatherCondition(code, isDay),
  };
}

// WMO weather codes — https://open-meteo.com/en/docs
function weatherLabel(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? "Sunny" : "Clear";
  if (code === 1) return isDay ? "Mostly sunny" : "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "—";
}

function weatherCondition(code: number, isDay: boolean): WeatherCondition {
  if (!isDay) return "night";
  if (code === 0 || code === 1) return "sunny";
  if (code <= 48) return "cloudy";
  if (code <= 99) return "rain";
  return "sunny";
}
