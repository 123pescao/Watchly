import asyncio
from app.utils.email_utils import send_email_via_sendgrid

async def test_email():
    to_email = "gaiuscaesar.pr@gmail.com"
    subject = "🔴 Test Alert: Website Down!"
    message = "This is a manual test email from Watchly to verify alert emails."

    result = await send_email_via_sendgrid(to_email, subject, message)
    print(f"📨 Email sent result: {result}")

asyncio.run(test_email())

