resource "google_compute_router" "payment-service-router" {
  name    = var.router_name
  region  = var.region
  network = "fis-g4-network-cd"

  bgp {
    asn = 64514
  }
}

resource "google_compute_subnetwork" "payment_service_subnetwork" {
  name          = "payment-service-subnetwork"
  ip_cidr_range = "10.0.13.0/24"
  region        = var.region
  network       = "fis-g4-network-cd"
}

resource "google_compute_router_nat" "payment_service_cloud_nat" {
  name                               = var.cloud_nat_name
  router                             = google_compute_router.payment-service-router.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"

  subnetwork {
    name          = google_compute_subnetwork.payment_service_subnetwork.name
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}