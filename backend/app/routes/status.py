from flask_restx import Namespace, Resource
from flask import jsonify
import requests
from flask_jwt_extended import jwt_required
from app import db
from app.models import Metric, Website  #Import Metric model

status_ns = Namespace("status", description="Website status monitoring")

@status_ns.route("/<path:url>")
class WebsiteStatus(Resource):
    @jwt_required()
    def get(self, url):
        """Check website status, uptime, and response time, then store it in the database"""
        try:
            response = requests.get(url, timeout=5)
            status_code = response.status_code
            response_time = response.elapsed.total_seconds() * 1000  #Convert to ms
            is_online = 1.0 if status_code == 200 else 0.0

            # Find the website ID from the database
            website = Website.query.filter_by(url=url).first()
            if website:
                #Save metric to database
                new_metric = Metric(
                    website_id=website.id,
                    response_time=response_time,
                    uptime=is_online  #Store as True (1) or False (0)
                )
                db.session.add(new_metric)
                db.session.commit()

            return {
                "status": "online" if is_online else "offline",
                "response_time": response_time,
                "status_code": status_code
            }, 200

        except requests.exceptions.RequestException:
            return {
                "status": "offline",
                "response_time": None,
                "status_code": None
            }, 200
