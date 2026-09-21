import frappe
from frappe.model.document import Document

class Role(Document):
    def validate(self):
        """Validates that role belongs to the User hierarchy: User -> Farmer, Officer, Admin"""
        valid_roles = ["FARMER", "OFFICER", "ADMIN"]
        if self.role_code not in valid_roles:
            frappe.throw(f"Invalid role code {self.role_code}. Must be one of {valid_roles}")
        
        if not self.parent_role:
            self.parent_role = "User"
