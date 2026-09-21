import frappe
from frappe.model.document import Document

class SchemeApplication(Document):
    def on_submit(self):
        """Dispatches DBT trigger upon officer approval"""
        if self.status == "APPROVED_BY_OFFICER":
            self.status = "DBT_DISBURSED"
            self.utr_reference = f"HPSC{frappe.utils.now_datetime().strftime('%Y%m%d%H%M%S')}"
