from abc import ABC, abstractmethod
from typing import Optional, BinaryIO
from pydantic import BaseModel


class FileUploadResult(BaseModel):
    file_key: str
    url: str
    content_type: str
    size_bytes: int


class StorageService(ABC):
    @abstractmethod
    async def upload_file(
        self, file_obj: BinaryIO, file_name: str, content_type: str
    ) -> FileUploadResult:
        pass

    @abstractmethod
    async def generate_presigned_url(
        self, file_key: str, expiration_seconds: int = 3600
    ) -> str:
        pass

    @abstractmethod
    async def delete_file(self, file_key: str) -> bool:
        pass


class LocalS3StorageService(StorageService):
    """
    S3 / MinIO compatible storage service implementation.
    """

    def __init__(self, bucket_name: str = "socialpilot-assets", endpoint_url: Optional[str] = None):
        self.bucket_name = bucket_name
        self.endpoint_url = endpoint_url or "http://localhost:9000"

    async def upload_file(
        self, file_obj: BinaryIO, file_name: str, content_type: str
    ) -> FileUploadResult:
        # Abstract file upload implementation
        file_key = f"uploads/{file_name}"
        url = f"{self.endpoint_url}/{self.bucket_name}/{file_key}"
        return FileUploadResult(
            file_key=file_key,
            url=url,
            content_type=content_type,
            size_bytes=1024,
        )

    async def generate_presigned_url(
        self, file_key: str, expiration_seconds: int = 3600
    ) -> str:
        return f"{self.endpoint_url}/{self.bucket_name}/{file_key}?expires={expiration_seconds}"

    async def delete_file(self, file_key: str) -> bool:
        return True


storage_service = LocalS3StorageService()
