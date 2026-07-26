from typing import List
from app.api.v1.notifications import NotificationSchema


class NotificationService:
    @staticmethod
    async def get_notifications() -> List[NotificationSchema]:
        return [
            NotificationSchema(
                id="notif-1",
                title="Campaign Published",
                message="AI Campaign #47 published to 6 accounts",
                type="success",
                is_read=False,
            ),
            NotificationSchema(
                id="notif-2",
                title="Trend Detected",
                message="#AIProductivity trending +840% on Twitter",
                type="info",
                is_read=False,
            ),
        ]
