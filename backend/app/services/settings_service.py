from app.api.v1.settings import AppSettingsSchema


class SettingsService:
    @staticmethod
    async def get_settings() -> AppSettingsSchema:
        return AppSettingsSchema(
            brand_name="SocialPilot AI",
            timezone="UTC",
            date_format="YYYY-MM-DD",
            auto_publish=True,
            openai_key=None,
            anthropic_key=None,
            gemini_key=None,
        )
