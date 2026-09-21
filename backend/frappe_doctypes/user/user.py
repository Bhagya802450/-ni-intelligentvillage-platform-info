import frappe
from frappe.model.document import Document

class User(Document):
    def validate(self):
        """Validates that User is assigned one of the 3 canonical roles: Farmer, Officer, Admin"""
        allowed = ["FARMER", "OFFICER", "ADMIN"]
        if self.role not in allowed:
            frappe.throw(f"Role '{self.role}' is invalid. Allowed roles are: {', '.join(allowed)}")
        
        if self.role == "FARMER" and not self.agristack_id:
            self.agristack_id = f"AGRI-HP-2026-{frappe.generate_hash(length=4).upper()}"
