import asyncio
import httpx
import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from app import create_app, db
from app.models import Website, Metric, Alert, User
from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from app.utils.logger import logger
from sqlalchemy.sql import text  # Ensure text is imported
import time
import sys
import os
import aiohttp


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

scheduler = BackgroundScheduler()

# Function to check Website status
async def check_websites(website):
    logger.info(f"🔎 Checking website: {website.url}")

    async with httpx.AsyncClient() as client:
        try:
            start_time = datetime.utcnow()

            response = await client.get(website.url, timeout=5, follow_redirects=True)
            response_time = (datetime.utcnow() - start_time).total_seconds() * 1000  # Convert to ms

            # Allows 2xx-3xx as Up for redirects
            if 200 <= response.status_code < 400:
                uptime = 1
            else:
                uptime = 0
            if uptime == 0:
                logger.warning(f"⚠️ {website.url} responded with {response.status_code}, marking as DOWN.")

        except httpx.RequestError as e:
            # Connection failed - Website is down
            response_time = 0  # ✅ Ensure response_time is not None
            uptime = 0
            logger.error(f"❌ {website.url} is DOWN - Connection Failed: {str(e)}")

    # ✅ Ensure timestamp is declared
    timestamp = datetime.utcnow()

    result = {
        "website_id": website.id,
        "response_time": response_time,
        "uptime": uptime,
        "timestamp": timestamp,
    }

    return result

# Function to check all websites
async def check_all_websites(app):
    with app.app_context():
        websites = db.session.execute(db.select(Website)).scalars().all()
        semaphore = asyncio.Semaphore(10)

        async def limited_check(website):
            async with semaphore:
                return await check_websites(website)

        tasks = [limited_check(website) for website in websites]
        results = await asyncio.gather(*tasks)

        db.session.bulk_insert_mappings(Metric, [
            {
                "website_id": result["website_id"],
                "response_time": result["response_time"],
                "uptime": result["uptime"],
                "timestamp": result["timestamp"]
            }
            for result in results
        ])
        db.session.commit()
        logger.info("✅ Metrics saved successfully!")

        # Run alerts concurrently
        alert_tasks = [
            check_for_alert(result["website_id"], "Website Down", app)
            if result["uptime"] == 0
            else check_for_alert(result["website_id"], "Website Up", app)
            for result in results
        ]
        for task in alert_tasks:
            await task #Ensures emails are sent immediately

# Function to check alert conditions
async def check_for_alert(website_id, alert_type, app):
    from app.utils.email_utils import send_email_via_cloudflare as send_alert_email

    with app.app_context():
        website = db.session.get(Website, website_id)
        if not website:
            logger.error(f"Alert triggered for non-existent website ID {website_id}")
            return

        user = db.session.get(User, website.user_id)
        if not user:
            logger.error(f"User not found for alert on website {website.url}")
            return

        latest_metric = db.session.query(Metric).filter_by(website_id=website_id).order_by(Metric.timestamp.desc()).first()
        uptime_percent = f"{(latest_metric.uptime * 100):.1f}%" if latest_metric else "N/A"
        response_time = f"{latest_metric.response_time:.2f} ms" if latest_metric and latest_metric.response_time > 0 else "N/A"

        existing_alert = Alert.query.filter_by(
            website_id=website_id,
            alert_type="Website Down",
            status="unresolved"
        ).first()

        subject = ""
        content = ""

        if alert_type == "Website Down":
            now = datetime.utcnow()

            if existing_alert:
                last_sent_time = existing_alert.timestamp
                time_since_last_email = now - last_sent_time

                if time_since_last_email < timedelta(minutes=30):
                    logger.info(f"Skipping duplicate 'Website Down' alert for {website.url} (Last email sent {time_since_last_email.seconds // 60} min ago)")
                    return

                existing_alert.timestamp = now
                db.session.commit()
                logger.info(f"⚠️ Reminder: {website.url} is STILL DOWN. Sending reminder email.")

                subject = f"⚠️ Reminder: {website.url} is STILL DOWN!"
                content = f"""
                🚨 **Your website {website.url} is still down!** 🚨

                **Latest Status:**
                - Uptime: {uptime_percent}
                - Response Time: {response_time}

                Regards,  
                **Watchly Monitoring**
                """
            else:
                new_alert = Alert(
                    website_id=website_id,
                    alert_type=alert_type,
                    status="unresolved",
                    timestamp=now,
                )
                db.session.add(new_alert)
                db.session.commit()
                logger.info(f"New alert created for {website.url} - Type: {alert_type}")

                subject = f"⚠️ Alert: {website.url} is DOWN!"
                content = f"""
                🚨 **Website Down Alert** 🚨

                Your monitored website **{website.url}** is currently down.

                **Latest Status:**
                - Uptime: {uptime_percent}
                - Response Time: {response_time}

                Regards,
                **Watchly Monitoring**
                """

        elif alert_type == "Website Up":
            if existing_alert:
                existing_alert.status = "resolved"
                db.session.commit()
                logger.info(f"✅ Resolved: {website.url} is back online.")

                subject = f"✅ Resolved: {website.url} is back UP!"
                content = f"""
                ✅ **Website Back Online** ✅

                Good news! **{website.url}** is back up.

                **Latest Status:**
                - Uptime: {uptime_percent}
                - Response Time: {response_time}

                Regards,
                **Watchly Monitoring**
                """

        if subject and content:  # Ensures subject and content are set before sending email
            logger.info(f"🔄 Sending alert email via Cloudflare Worker to {user.email} for {website.url}")
            result = await send_alert_email(user.email, subject, content)

            if result:
                logger.info(f"📨 Email Sent Successfully to {user.email}")
            else:
                logger.error(f"❌ Email Sending Failed for {user.email}")


def run_monitoring_task(app):
    """Runs the async check_all_websites() function in a synchronous context."""
    asyncio.run(check_all_websites(app))

def start_monitoring(app):
    """Starts the APScheduler job for monitoring websites at intervals."""
    if not scheduler.running:
        logger.info("✅ Starting monitoring service...")
        scheduler.add_job(run_monitoring_task, "interval", seconds=30, args=[app])
        scheduler.start()
    else:
        logger.info("🚀 Scheduler is already running. Skipping duplicate start.")

if __name__ == "__main__":
    from app import create_app
    app = create_app()
    start_monitoring(app)
