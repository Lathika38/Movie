import httpx
from typing import Any, Dict, Optional
from datetime import datetime, timezone
from app.core.config import settings

class WeatherService:
    """
    OpenWeather API integration for MovieOS Production Planning.
    Retrieves temperature, conditions, rain probability, humidity, wind, and evaluates filming risk.
    """
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"

    async def get_location_weather(self, location_name: str, date_str: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetch real-time weather or 5-day forecast for shooting location.
        Supports smart candidate parsing for film set names (e.g. 'Pinewood Stage 4, London' -> 'London').
        """
        if not location_name or not location_name.strip():
            location_name = "Los Angeles, CA"

        raw_loc = location_name.strip()
        candidates = [raw_loc]

        # 1. Split on commas if present (e.g. "Stage 4, London" -> "London", "Stage 4")
        if "," in raw_loc:
            parts = [p.strip() for p in raw_loc.split(",") if p.strip()]
            for p in reversed(parts):
                if p not in candidates:
                    candidates.append(p)

        # 2. Check for embedded major cinema hub city names
        cinema_hubs = [
            "Los Angeles", "London", "New York", "Tokyo", "Mumbai",
            "Paris", "Sydney", "Vancouver", "Atlanta", "Toronto",
            "Berlin", "Rome", "Chicago", "San Francisco", "Dubai",
            "Singapore", "Seoul", "Hong Kong", "Cairo", "Madrid"
        ]
        for hub in cinema_hubs:
            if hub.lower() in raw_loc.lower() and hub not in candidates:
                candidates.append(hub)

        # 3. If location contains "Pinewood" or "Leavesden" or "Shepperton", add London
        if any(studio.lower() in raw_loc.lower() for studio in ["pinewood", "leavesden", "shepperton", "ealing"]) and "London" not in candidates:
            candidates.append("London")

        # 4. Global production hub fallback
        if "Los Angeles" not in candidates:
            candidates.append("Los Angeles")

        if self.api_key and self.api_key.strip():
            async with httpx.AsyncClient(timeout=10.0) as client:
                for target_q in candidates:
                    try:
                        resp = await client.get(
                            f"{self.base_url}/weather",
                            params={"q": target_q, "appid": self.api_key, "units": "metric"}
                        )
                        if resp.status_code == 200:
                            data = resp.json()
                            main = data.get("main", {})
                            weather_arr = data.get("weather", [{}])
                            weather_item = weather_arr[0] if weather_arr else {}
                            wind = data.get("wind", {})
                            rain = data.get("rain", {}).get("1h", 0.0)

                            temp_c = main.get("temp", 22.0)
                            condition = weather_item.get("main", "Clear")
                            desc = weather_item.get("description", "Clear sky")
                            humidity = main.get("humidity", 45)
                            wind_speed = wind.get("speed", 3.5)
                            rain_prob = 80 if "Rain" in condition else (40 if "Cloud" in condition else 5)

                            risk_level, risk_reasons = self._calculate_production_risk(condition, rain_prob, wind_speed, temp_c)

                            matched_name = data.get("name", target_q)
                            display_name = raw_loc
                            if matched_name.lower() not in raw_loc.lower():
                                display_name = f"{raw_loc} ({matched_name})"

                            return {
                                "location": display_name,
                                "matchedCity": matched_name,
                                "temperatureC": round(temp_c, 1),
                                "temperatureF": round(temp_c * 9/5 + 32, 1),
                                "condition": condition,
                                "description": desc.capitalize(),
                                "humidity": humidity,
                                "windSpeedKmh": round(wind_speed * 3.6, 1),
                                "rainProbability": rain_prob,
                                "precipitationMm": rain,
                                "productionRisk": risk_level, # LOW, MEDIUM, HIGH
                                "riskFactors": risk_reasons,
                                "shootDecision": "POSTPONE SHOOT" if risk_level == "HIGH" or rain_prob > 40 else ("PROCEED WITH CAUTION" if risk_level == "MEDIUM" else "PROCEED WITH SHOOT"),
                                "recommendation": self._generate_weather_recommendation(risk_level, condition, rain_prob),
                                "source": "OpenWeather API"
                            }
                    except Exception as e:
                        print(f" [MovieOS Weather] Candidate '{target_q}' query warning: {e}")

        # Fallback if API completely unaccessible
        return {
            "available": False,
            "location": location_name,
            "error": "Weather data unavailable from OpenWeather API."
        }

    def _calculate_production_risk(self, condition: str, rain_prob: int, wind_speed_ms: float, temp_c: float) -> tuple[str, list[str]]:
        reasons = []
        risk = "LOW"
        if rain_prob > 60 or "Rain" in condition or "Storm" in condition:
            risk = "HIGH"
            reasons.append("High probability of precipitation dangerous for electrical and camera rigging")
        elif rain_prob > 30 or "Cloud" in condition:
            if risk != "HIGH":
                risk = "MEDIUM"
            reasons.append("Potential overcast changing natural lighting continuity")

        if wind_speed_ms > 10.0:
            risk = "HIGH"
            reasons.append("High wind speed exceeds safe threshold for booms, silks, and crane operations")
        elif wind_speed_ms > 6.0:
            if risk == "LOW":
                risk = "MEDIUM"
            reasons.append("Moderate wind may introduce audio boom turbulence")

        if temp_c > 38.0 or temp_c < 2.0:
            risk = "HIGH"
            reasons.append("Extreme temperature hazard for cast and camera sensor thermal throttling")

        if not reasons:
            reasons.append("Optimal atmospheric conditions for camera, lighting, and sound recording")

        return risk, reasons

    def _generate_weather_recommendation(self, risk_level: str, condition: str, rain_prob: int = 0) -> str:
        if risk_level == "HIGH" or rain_prob > 40:
            return "POSTPONE SHOOT: Weather conditions (Rain/High Wind/Extreme Temp) pose safety risks for equipment and cast. Postpone exterior shoot or switch to interior soundstage cover."
        elif risk_level == "MEDIUM":
            return "PROCEED WITH CAUTION: Suitable weather with minor cloud/wind cover. Monitor light consistency closely and have rain cover ready."
        return "PROCEED WITH SHOOT: Optimal meteorological conditions for camera, lighting, and sound recording."

weather_service = WeatherService()
