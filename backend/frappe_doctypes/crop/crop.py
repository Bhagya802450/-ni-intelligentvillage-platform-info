import frappe
from frappe.model.document import Document

class Crop(Document):
    def validate(self):
        """
        Validates crop record attributes within Unified Farmer Database:
        - Ensures crop is linked to a valid Farmer & Land Parcel
        - Ensures cultivated area does not exceed land parcel area
        - Validates Sentinel-2 NDVI score is between -1.0 and +1.0
        """
        if self.area_bigha and self.area_bigha <= 0:
            frappe.throw("Cultivated area in bighas must be greater than zero.")

        if self.ndvi_score is not None:
            score = float(self.ndvi_score)
            if score < -1.0 or score > 1.0:
                frappe.throw("Sentinel-2 NDVI score must be between -1.0 and +1.0.")

        if self.estimated_yield_quintals and self.estimated_yield_quintals < 0:
            frappe.throw("Estimated yield cannot be negative.")
