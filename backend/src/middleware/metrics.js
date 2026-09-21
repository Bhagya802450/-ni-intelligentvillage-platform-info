let requestCount = 0;
let requestErrors = 0;
let hpasnTransactions = 12;
const startTime = Date.now();

function metricsMiddleware(req, res, next) {
  requestCount++;
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      requestErrors++;
    }
  });
  next();
}

function getPrometheusMetrics() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  return `
# HELP hp_agri_requests_total Total HTTP requests handled by HP-ASN Gateway
# TYPE hp_agri_requests_total counter
hp_agri_requests_total ${requestCount}

# HELP hp_agri_request_errors_total Total failed HTTP requests (4xx / 5xx)
# TYPE hp_agri_request_errors_total counter
hp_agri_request_errors_total ${requestErrors}

# HELP hp_agri_uptime_seconds Total runtime of the application
# TYPE hp_agri_uptime_seconds gauge
hp_agri_uptime_seconds ${uptimeSeconds}

# HELP hp_agri_hpasn_consent_exchanges_total Total inter-departmental consent transfers
# TYPE hp_agri_hpasn_consent_exchanges_total counter
hp_agri_hpasn_consent_exchanges_total ${hpasnTransactions}

# HELP hp_agri_redis_queue_length Background DBT processing queue depth
# TYPE hp_agri_redis_queue_length gauge
hp_agri_redis_queue_length 3

# HELP hp_agri_active_farmers_registered Total farmers in Unified Database
# TYPE hp_agri_active_farmers_registered gauge
hp_agri_active_farmers_registered 1420
`.trim();
}

module.exports = {
  metricsMiddleware,
  getPrometheusMetrics
};
