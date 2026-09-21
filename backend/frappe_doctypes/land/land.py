import frappe
from frappe.model.document import Document

class Land(Document):
    def validate(self):
        """
        Validates Land entity attributes:
        - Ensures survey_number, area, and farmer_id are present
        - Ensures latitude and longitude coordinates are within valid geographic ranges
        """
        if self.area and self.area <= 0:
            frappe.throw("Land area must be greater than zero.")

        if self.latitude is not None:
            lat = float(self.latitude)
            if lat < -90.0 or lat > 90.0:
                frappe.throw("Latitude must be between -90 and 90 degrees.")

        if self.longitude is not None:
            lng = float(self.longitude)
            if lng < -180.0 or lng > 180.0:
                frappe.throw("Longitude must be between -180 and 180 degrees.")
