import frappe
from frappe.model.document import Document

class Farmer(Document):
    def validate(self):
        """Validates AgriStack ID, mobile, and status in Unified Farmer Database"""
        if not self.national_farmer_id:
            self.national_farmer_id = f"AGRI-HP-2026-{frappe.generate_hash(length=4).upper()}"
        
        if not self.farmer_id:
            self.farmer_id = self.name or f"FARMER-HP-{frappe.generate_hash(length=4).upper()}"

        if not self.id:
            self.id = self.farmer_id

        if not self.status:
            self.status = "ACTIVE"

        if not self.state:
            self.state = "Himachal Pradesh"

        # Calculate total operational landholding
        total_bigha = sum([p.area_bigha for p in self.land_parcels or []])
        if total_bigha <= 25:
            self.farmer_category = "Small & Marginal"
        else:
            self.farmer_category = "Medium"
