#Alerts
from flask_restx import Namespace, Resource, fields
from flask import request, jsonify
from app.routes.auth import token_required
from app.models import Alert, Website
from app import db
from datetime import datetime
from app.utils import email_utils


alerts_ns= Namespace('alerts', description="Alert Management Endpoints")

#Request/Response Models
alert_model = alerts_ns.model("Alert", {
    "id": fields.Integer,
    "website_id": fields.Integer,
    "alert_type": fields.String,
    "status": fields.String,
    "timestamp": fields.DateTime
})

create_alert_model = alerts_ns.model("CreateAlert", {
    "website_id": fields.Integer(required=True, description="Website ID"),
    "alert_type": fields.String(required=True, description="Type of Alert")
})

update_alert_model = alerts_ns.model("UpdateAlert", {
    "status": fields.String(required=False, description="Updated Status"),
    "alert_type": fields.String(required=False, description="Updated Alert Type")
})

resolve_alert_model = alerts_ns.model(
    "ResolveAlert",
    {"status": fields.String(required=True, description="New Alert Status")}
)


#Add alerts
@alerts_ns.route('/add')
class AddAlert(Resource):
    @alerts_ns.expect(create_alert_model)
    @alerts_ns.response(201, "Alert created successfully!", alert_model)
    @alerts_ns.response(400, "Website ID and alert type required!")
    @alerts_ns.response(404, "Website not found or unauthorized")
    @token_required
    def post(self, current_user):
        """Create a new alert for a website"""
        data = request.get_json()
        website_id = data.get("website_id")
        alert_type = data.get("alert_type")

        #Ensure required fields provided
        if not website_id or not alert_type:
            return {"error": "Website ID and alert type required!"}, 400

        #Check if website exists and belongs to user
        website = Website.query.filter_by(id=website_id, user_id=current_user.id).first()

        if not website:
            return {"error": "Website not found or unauthorized"}, 404

        #Create new alert
        new_alert = Alert(
            website_id=website.id,
            alert_type=alert_type,
            status="unresolved",
            timestamp=datetime.utcnow()
        )

        #Save alert to db
        db.session.add(new_alert)
        db.session.commit()

        return jsonify({
            "message": "Alert created successfully!",
            "alert": {
                "id": new_alert.id,
                "website_id": new_alert.website_id,
                "alert_type": new_alert.alert_type,
                "status": new_alert.status,
                "timestamp": new_alert.timestamp
            }
        }), 201

#Fetch alerts
@alerts_ns.route('', '/')
class GetAlerts(Resource):
    @alerts_ns.response(200, "Alerts retrieved successfully!", [alert_model])
    @token_required
    def get(self, current_user):
        """Fetch all alerts for user's websites"""
        website_id = request.args.get("website_id", type=int)
        user_websites = Website.query.filter_by(user_id=current_user.id).all()
        user_website_ids = {website.id for website in user_websites}

        if website_id and website_id not in user_website_ids:
            return {"error": "Website not found or unauthorized"}, 404

        alerts_query = Alert.query.filter(Alert.website_id.in_(user_website_ids))
        if website_id:
            alerts_query = alerts_query.filter_by(website_id=website_id)

        alerts = alerts_query.all()
        return [{
            "id": alert.id,
            "website_id": alert.website_id,
            "alert_type": alert.alert_type,
            "status": alert.status,
            "timestamp": alert.timestamp.isoformat(),
        } for alert in alerts], 200


# Update an alert
@alerts_ns.route('/<int:alert_id>')
class UpdateAlert(Resource):
    @alerts_ns.expect(update_alert_model)
    @alerts_ns.response(200, "Alert updated successfully!", alert_model)
    @alerts_ns.response(404, "Alert not found")
    @token_required
    def patch(self, current_user, alert_id):
        """Update an existing alert"""
        alert = Alert.query.get(alert_id)
        if not alert:
            return {"error": "Alert not found"}, 404

        data = request.get_json()
        if "status" in data:
            alert.status = data["status"]
        if "alert_type" in data:
            alert.alert_type = data["alert_type"]

        db.session.commit()

        return {
            "message": "Alert updated successfully!",
            "alert": {
                "id": alert.id,
                "website_id": alert.website_id,
                "alert_type": alert.alert_type,
                "status": alert.status,
                "timestamp": alert.timestamp.isoformat(),
            }
        }, 200

#Resolve the alert
@alerts_ns.route("/resolve/<int:alert_id>")
class ResolveAlert(Resource):
    @alerts_ns.response(200, "Alert Resolved Successfully!", alert_model)
    @alerts_ns.response(404, "Alert Not Found")
    @alerts_ns.response(403, "Unauthorized")
    @token_required
    def put(self, current_user, alert_id):
        """Resolve an alert for a monitored website"""

        alert = db.session.get(Alert, alert_id)
        if not alert:
            return {"error": "Alert not found"}, 404

        # Ensure the user owns the website associated with the alert
        website = db.session.get(Website, alert.website_id)
        if not website or website.user_id != current_user.id:
            return {"error": "Unauthorized to resolve this alert"}, 403

        # Update alert status
        alert.status = "resolved"
        db.session.commit()

        return {
            "message": "Alert resolved successfully!",
            "alert": {
                "id": alert.id,
                "website_id": alert.website_id,
                "alert_type": alert.alert_type,
                "status": alert.status,
                "timestamp": alert.timestamp.isoformat(),
            },
        }, 200


#Get Alerts History
@alerts_ns.route("/history")
class AlertsHistory(Resource):
    @alerts_ns.response(200, "Alert History Retrieved Successfully!", [alert_model])
    @alerts_ns.response(404, "Website Not Found or Unauthorized")
    @token_required
    def get(self, current_user):
        """Retrieve alert history for monitored websites"""
        from app.models import Alert, Website  # Avoid circular imports

        website_id = request.args.get("website_id", type=int)
        status = request.args.get("status")

        # Fetch user websites
        user_websites = Website.query.filter_by(user_id=current_user.id).all()
        user_website_ids = {website.id for website in user_websites}

        # Validate website_id
        if website_id and website_id not in user_website_ids:
            return {"error": "Website not found or unauthorized"}, 404

        # Query alerts
        alerts_query = Alert.query.filter(Alert.website_id.in_(user_website_ids))
        if website_id:
            alerts_query = alerts_query.filter_by(website_id=website_id)
        if status:
            alerts_query = alerts_query.filter_by(status=status)

        alerts = alerts_query.order_by(Alert.timestamp.desc()).all()

        # Serialize response
        alerts_data = [
            {
                "id": alert.id,
                "website_id": alert.website_id,
                "alert_type": alert.alert_type,
                "status": alert.status,
                "timestamp": alert.timestamp.isoformat(),
            }
            for alert in alerts
        ]
        return alerts_data, 200
