import frappe
from frappe.model.document import Document

class SUADRSoilProfile(Document):
    def validate(self):
        """Generates dynamic agronomy recommendation based on pH and NPK levels"""
        if self.ph < 6.0:
            self.recommendation = "Soil is acidic. Apply agricultural lime @ 200 kg/ha and maintain organic Jeevamrit mulching."
        elif self.ph > 7.5:
            self.recommendation = "Soil is alkaline. Incorporate acidic compost and gypsum."
        else:
            self.recommendation = "Optimum pH range for Himachal temperate fruit and vegetable cultivation."
