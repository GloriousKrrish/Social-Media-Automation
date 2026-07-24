import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "service" in data


@pytest.mark.asyncio
async def test_metrics(client: AsyncClient):
    response = await client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["system_status"] == "operational"
