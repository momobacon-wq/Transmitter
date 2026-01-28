import React, { useState, useEffect } from 'react';

const RetroWeather = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    // Default: Taipei (25.0330, 121.5654)
    const LAT = 25.0330;
    const LON = 121.5654;

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`);
                const data = await res.json();
                setWeather(data.current_weather);
                setLoading(false);
            } catch (err) {
                console.error("Weather fetch failed", err);
                setLoading(false);
            }
        };

        fetchWeather();
        const timer = setInterval(fetchWeather, 600000); // Refresh every 10 min
        return () => clearInterval(timer);
    }, []);

    const getWeatherIcon = (code) => {
        // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
        if (code === 0) return "☀️"; // Clear sky
        if (code >= 1 && code <= 3) return "🌤️"; // PCRTLY CLOUDY
        if (code >= 45 && code <= 48) return "🌫️"; // FOG
        if (code >= 51 && code <= 67) return "🌧️"; // DRIZZLE/RAIN
        if (code >= 71 && code <= 77) return "🌨️"; // SNOW
        if (code >= 80 && code <= 82) return "🌦️"; // SHOWERS
        if (code >= 95 && code <= 99) return "🌩️"; // THUNDERSTORM
        return "❓";
    };

    if (loading) return <span style={{ fontSize: '0.8rem', color: '#888' }}>SCANNING...</span>;
    if (!weather) return <span style={{ fontSize: '0.8rem', color: '#d9534f' }}>OFFLINE</span>;

    return (
        <div className="nes-container is-rounded is-dark" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>{getWeatherIcon(weather.weathercode)}</span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem', color: '#fff' }}>
                {Math.round(weather.temperature)}°C
            </span>
        </div>
    );
};

export default RetroWeather;
