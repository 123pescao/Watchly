import os
import asyncio
import requests
import httpx
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
from app.utils.logger import logger  # Ensure logger is imported
import time

load_dotenv()

CLOUDFLARE_WORKER_URL = "https://watchly-worker.joel-caban2017.workers.dev/send-email"
SENDGRID_API_KEY = os.getenv("SENDGRID_DEV_API_KEY")
FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")

if not SENDGRID_API_KEY:
    logger.error("❌ ERROR: SendGrid API Key not found! Check .env file.")
    exit(1)

if not FROM_EMAIL:
    logger.error("❌ ERROR: FROM_EMAIL is missing! Make sure it's a verified sender in SendGrid.")
    exit(1)

async def send_email_via_cloudflare(to_email, subject, message):
    """
    Sends an email using Cloudflare Worker as a proxy.
    """
    data = {
        "to": to_email,
        "subject": subject,
        "message": message
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(CLOUDFLARE_WORKER_URL, json=data)
            logger.info(f"📨 Cloudflare Worker Response: {response.status_code}, {response.text}")
            return response.status_code == 200  # Return True if success
        except Exception as e:
            logger.error(f"❌ Failed to send email via Cloudflare: {str(e)}")
            return False

async def send_email_via_sendgrid(to_email, subject, message):
    """
    Sends an email directly via SendGrid.
    """
    sg = SendGridAPIClient(SENDGRID_API_KEY)
    email = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        plain_text_content=message
    )

    loop = asyncio.get_event_loop()
    max_retries = 3  # Retry up to 3 times

    for attempt in range(max_retries):
        try:
            send_time = time.time()
            response = await loop.run_in_executor(None, sg.send, email)
            recieve_time = time.time()

            delay = recieve_time - send_time
            logger.info(f"✅ Email Sent via SendGrid! Status Code: {response.status_code}, Delay: {delay:.2f} seconds")

            return True
        except Exception as e:
            logger.error(f"❌ Email Sending Failed (Attempt {attempt + 1}/{max_retries}): {str(e)}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)  # Exponential backoff (wait 2s, then 4s)
            else:
                logger.error("❌ Email sending permanently failed after retries.")
    return False

# Test if email sending works
if __name__ == "__main__":
    test_email = "watchly.monitor@gmail.com"
    test_subject = "Test Email from Watchly"
    test_message = "This is a test email from Watchly using SendGrid."

    # Choose which method to use
    USE_CLOUDFLARE = True  # Set to False to send directly via SendGrid

    if USE_CLOUDFLARE:
        asyncio.run(send_email_via_cloudflare(test_email, test_subject, test_message))
    else:
        asyncio.run(send_email_via_sendgrid(test_email, test_subject, test_message))
