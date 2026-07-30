import httpx
from .config import get_settings


class AMapClient:
    base_url = "https://restapi.amap.com"

    def __init__(self) -> None:
        self.settings = get_settings()

    def _params(self, values: dict) -> dict:
        if not self.settings.amap_webservice_key:
            raise RuntimeError("AMAP_WEBSERVICE_KEY is not configured")
        return {"key": self.settings.amap_webservice_key, "output": "JSON", **values}

    async def nearby(self, location: str, keywords: str, radius: int = 2000) -> dict:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                f"{self.base_url}/v3/place/around",
                params=self._params({"location": location, "keywords": keywords, "radius": radius, "extensions": "all"}),
            )
            response.raise_for_status()
            data = response.json()
        if data.get("status") != "1":
            raise RuntimeError(data.get("info", "AMap request failed"))
        return data

    async def weather(self, city: str, extensions: str = "all") -> dict:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(
                f"{self.base_url}/v3/weather/weatherInfo",
                params=self._params({"city": city, "extensions": extensions}),
            )
            response.raise_for_status()
            data = response.json()
        if data.get("status") != "1":
            raise RuntimeError(data.get("info", "AMap request failed"))
        return data

