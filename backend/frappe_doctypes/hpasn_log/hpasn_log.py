import frappe
from frappe.model.document import Document
import hashlib

class HPASNConsentLog(Document):
    def before_insert(self):
        """Generates immutable cryptographic hash signature for audit compliance"""
        raw_payload = f"{self.transaction_id}:{self.source_dept}:{self.target_dept}:{self.farmer_id}"
        self.hash_signature = "0x" + hashlib.sha256(raw_payload.encode()).hexdigest()[:40]
