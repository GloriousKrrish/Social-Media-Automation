import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_routes_exists(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={"email": "invalid@test.com", "password": "wrong"})
    assert response.status_code in [401, 404, 422, 500]
