import frappe
from frappe.model.document import Document

class LandParcel(Document):
    def validate(self):
        """Auto computes Hectares from Bighas (HP Standard: 1 Bigha ≈ 0.08 Ha)"""
        if self.area_bigha:
            self.area_hectares = round(self.area_bigha * 0.08, 2)
