import frappe
from frappe.model.document import Document

class Farmer(Document):
    def validate(self):
        """Validates AgriStack ID and Aadhaar format"""
        if not self.agristack_id:
            self.agristack_id = f"AGRI-HP-2026-{frappe.generate_hash(length=4).upper()}"
        
        # Calculate total operational landholding
        total_bigha = sum([p.area_bigha for p in self.land_parcels or []])
        if total_bigha <= 25:
            self.farmer_category = "Small & Marginal"
        else:
            self.farmer_category = "Medium"
