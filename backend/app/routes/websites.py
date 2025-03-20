from flask_restx import Namespace, Resource, fields
from flask import request, jsonify
from app import db
from app.routes.auth import token_required


websites_ns = Namespace("websites", description="Manage Websites")

#Models
website_model = websites_ns.model(
    "Website",
    {
        "id": fields.Integer,
        "user_id": fields.Integer,
        "url": fields.String,
        "name": fields.String,
        "frequency": fields.Integer,
    },
)

add_website_model = websites_ns.model(
    "AddWebsite",
    {
        "url": fields.String(required=True, description="Website URL"),
        "name": fields.String(required=True, description="Website Name"),
        "frequency": fields.Integer(default=5, description="Monitoring Frequency (minutes)"),
    },
)

update_website_model = websites_ns.model(
    "UpdateWebsite",
    {
        "website_id": fields.Integer(required=True, description="Website ID"),
        "url": fields.String(description="Updated URL"),
        "name": fields.String(description="Updated Name"),
        "frequency": fields.Integer(description="Updated Frequency (minutes)"),
    },
)

delete_website_model = websites_ns.model(
    "DeleteWebsite",
    {"website_id": fields.Integer(required=True, description="Website ID")},
)

@websites_ns.route("/add", methods=["POST", "OPTIONS"])
class AddWebsite(Resource):
    @websites_ns.expect(add_website_model)
    @websites_ns.response(201, "Website Added Successfully!", website_model)
    @websites_ns.response(400, "Missing Required Fields")
    @token_required  # ✅ Keep this only on `post`, not `options`
    def post(self, current_user):
        """Add a new website for monitoring"""
        from app.models import Website  # Avoid circular imports

        data = request.get_json()
        url = data.get("url")
        name = data.get("name")
        frequency = data.get("frequency", 5)

        #Validate Required Fields
        if not url or not name:
            return {"error": "Missing required fields"}, 400

        # Create new Website object
        new_website = Website(user_id=current_user.id, url=url, name=name, frequency=frequency)

        db.session.add(new_website)
        db.session.commit()

        return {
            "message": "Website added successfully!",
            "website": {
                "id": new_website.id,
                "user_id": new_website.user_id,
                "url": new_website.url,
                "name": new_website.name,
                "frequency": new_website.frequency,
            },
        }, 201

    #Allow OPTIONS method for CORS preflight requests (NO authentication required)
    def options(self):
        return {}, 200


#Fetch and Add Websites
@websites_ns.route('', '/')
class GetWebsites(Resource):
    @websites_ns.response(200, "Websites Retrieved Successfully!", [website_model])
    @token_required
    def get(self, current_user):
        """Retrieve all monitored websites for the user"""
        from app.models import Website, Metric

        # Query user's websites
        websites = Website.query.filter_by(user_id=current_user.id).all()

        # Serialize data
        websites_data = []
        for website in websites:
            # Fetch latest metric for each website
            latest_metric = Metric.query.filter_by(website_id=website.id).order_by(Metric.timestamp.desc()).first()

            websites_data.append({
                "id": website.id,
                "url": website.url,
                "name": website.name,
                "frequency": website.frequency,
                "uptime": latest_metric.uptime if latest_metric else 0,
                "response_time": latest_metric.response_time if latest_metric else "N/A",
            })

        return websites_data, 200

    @websites_ns.response(201, "Website Created Successfully!", website_model)
    @websites_ns.response(400, "Invalid Request Data")
    @token_required
    def post(self, current_user):
        """Add a new website for the authenticated user"""
        from app import db
        from app.models import Website
        from flask import request

        data = request.get_json()

        if not data or "name" not in data or "url" not in data or "frequency" not in data:
            return {"error": "Missing required fields (name, url, frequency)"}, 400

        # Create new website entry
        new_website = Website(
            user_id=current_user.id,  # Ensure website is linked to the logged-in user
            name=data["name"],
            url=data["url"],
            frequency=data["frequency"]
        )

        db.session.add(new_website)
        db.session.commit()

        return {
            "id": new_website.id,
            "url": new_website.url,
            "name": new_website.name,
            "frequency": new_website.frequency,
        }, 201

#Update Website
@websites_ns.route("/update")
class UpdateWebsite(Resource):
    @websites_ns.expect(update_website_model)
    @websites_ns.response(200, "Website Updated Successfully!", website_model)
    @websites_ns.response(400, "Missing Required Fields")
    @token_required
    def put(self, current_user):
        """Update a monitored website"""
        from app.models import Website  # Import here to avoid circular dependencies

        data = request.get_json()
        website_id = data.get("website_id")
        url = data.get("url")
        name = data.get("name")
        frequency = data.get("frequency")

        # Validate website_id is provided
        if not website_id:
            return {"error": "Website ID is required"}, 400

        # Query database for website
        website = Website.query.filter_by(id=website_id, user_id=current_user.id).first()
        if not website:
            return {"error": "Website not found or unauthorized"}, 404

        # Update fields if provided
        if url:
            website.url = url
        if name:
            website.name = name
        if frequency:
            website.frequency = frequency

        # Commit changes
        db.session.commit()

        return {
            "message": "Website updated successfully!",
            "website": {
                "id": website.id,
                "user_id": website.user_id,
                "url": website.url,
                "name": website.name,
                "frequency": website.frequency,
            },
        }, 200


## Delete Website (RESTful DELETE)
@websites_ns.route("/delete/<int:website_id>", methods=["OPTIONS", "DELETE"])
class DeleteWebsite(Resource):
    @websites_ns.response(200, "Website Deleted Successfully!")
    @websites_ns.response(404, "Website Not Found or Unauthorized")
    @token_required
    def delete(self, current_user, website_id):
        """Delete a monitored website"""
        from app.models import Website, Metric, Alert  # Import here to avoid circular dependencies

        # Query database for website
        website = Website.query.filter_by(id=website_id, user_id=current_user.id).first()
        if not website:
            return {"error": "Website not found or unauthorized"}, 404

        # Delete related metrics and alerts
        Metric.query.filter_by(website_id=website.id).delete()
        Alert.query.filter_by(website_id=website.id).delete()

        # Delete website
        db.session.delete(website)
        db.session.commit()

        return {"message": "Website deleted successfully!"}, 200

    def options(self, website_id):
        """Handle CORS preflight for DELETE"""
        return {}, 200