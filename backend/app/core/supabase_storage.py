from typing import BinaryIO, Optional
import httpx
from app.core.config import settings
from app.core.storage import FileUploadResult, StorageService


class SupabaseStorageService(StorageService):
    """
    Supabase Storage Service implementation supporting bucket file operations,
    public URLs, and signed upload/download URLs.
    """

    def __init__(
        self,
        supabase_url: Optional[str] = None,
        service_key: Optional[str] = None,
        bucket_name: Optional[str] = None,
    ):
        self.supabase_url = supabase_url or settings.SUPABASE_URL or "https://placeholder.supabase.co"
        self.service_key = service_key or settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY or ""
        self.bucket_name = bucket_name or settings.SUPABASE_STORAGE_BUCKET

    def _get_headers(self) -> dict:
        return {
            "Authorization": f"Bearer {self.service_key}",
            "apikey": self.service_key,
        }

    async def upload_file(
        self, file_obj: BinaryIO, file_name: str, content_type: str
    ) -> FileUploadResult:
        file_key = f"uploads/{file_name}"
        upload_url = f"{self.supabase_url}/storage/v1/object/{self.bucket_name}/{file_key}"

        content = file_obj.read()
        headers = self._get_headers()
        headers["Content-Type"] = content_type

        async with httpx.AsyncClient() as client:
            response = await client.post(upload_url, content=content, headers=headers)
            if response.status_code not in (200, 201):
                # Fallback to PUT if object already exists or UPSERT requested
                headers["x-upsert"] = "true"
                response = await client.put(upload_url, content=content, headers=headers)

        public_url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{file_key}"

        return FileUploadResult(
            file_key=file_key,
            url=public_url,
            content_type=content_type,
            size_bytes=len(content),
        )

    async def generate_presigned_url(
        self, file_key: str, expiration_seconds: int = 3600
    ) -> str:
        sign_endpoint = f"{self.supabase_url}/storage/v1/object/sign/{self.bucket_name}/{file_key}"
        headers = self._get_headers()
        headers["Content-Type"] = "application/json"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                sign_endpoint,
                json={"expiresIn": expiration_seconds},
                headers=headers,
            )
            if response.status_code == 200:
                data = response.json()
                signed_path = data.get("signedURL")
                if signed_path:
                    if signed_path.startswith("http"):
                        return signed_path
                    return f"{self.supabase_url}/storage/v1{signed_path}"

        # Fallback to public URL if signed URL generation returns error or unconfigured
        return f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{file_key}"

    async def delete_file(self, file_key: str) -> bool:
        delete_url = f"{self.supabase_url}/storage/v1/object/{self.bucket_name}"
        headers = self._get_headers()
        headers["Content-Type"] = "application/json"

        async with httpx.AsyncClient() as client:
            response = await client.request(
                "DELETE", delete_url, json={"prefixes": [file_key]}, headers=headers
            )
            return response.status_code == 200
