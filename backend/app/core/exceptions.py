from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        message: str,
        code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "success": False,
                "error": {
                    "code": code,
                    "message": message,
                    "details": details or {},
                },
            },
        )


class EntityNotFoundException(AppException):
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=f"{entity_name} with ID '{entity_id}' not found.",
            code="ENTITY_NOT_FOUND",
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Invalid or expired authentication credentials."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message=message,
            code="UNAUTHORIZED",
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Access denied due to insufficient permissions."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            message=message,
            code="FORBIDDEN",
        )


class ValidationException(AppException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            message=message,
            code="VALIDATION_ERROR",
            details=details,
        )


class DuplicateEntityException(AppException):
    def __init__(self, entity_name: str, field: str, value: Any):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            message=f"{entity_name} with {field} '{value}' already exists.",
            code="DUPLICATE_ENTITY",
        )
