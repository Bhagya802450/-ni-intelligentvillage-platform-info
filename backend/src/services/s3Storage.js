/**
 * S3-Compatible Object Storage Client
 * Supports MinIO / AWS S3 for satellite imagery and farmer cadastral deeds
 */

const mockS3Buckets = [
  {
    bucketName: "himbhoomi-cadastral-deeds",
    purpose: "Land Jamabandi & Cadastral Naksha PDFs (Revenue Dept)",
    region: "hp-north-1",
    totalObjects: 1420,
    sizeMB: 380.5
  },
  {
    bucketName: "satellite-multispectral-rasters",
    purpose: "Sentinel-2 NDVI & Thermal GeoTIFF Tiles",
    region: "hp-north-1",
    totalObjects: 540,
    sizeMB: 4890.2
  },
  {
    bucketName: "farmer-field-inspections",
    purpose: "Geo-tagged Site Photos & Officer DBT Verification Evidence",
    region: "hp-north-1",
    totalObjects: 890,
    sizeMB: 1250.0
  }
];

const mockFiles = [
  {
    key: "jamabandi/FARMER-HP-1001-khasra-412-12.pdf",
    bucket: "himbhoomi-cadastral-deeds",
    sizeKB: 245,
    uploadedAt: "2026-02-10T14:30:00Z",
    etag: "a98df24e12c40",
    url: "https://s3.hpagriculture.gov.in/himbhoomi-cadastral-deeds/jamabandi/412-12.pdf"
  },
  {
    key: "satellite/ndvi-kotkhai-orchards-2026-03.tif",
    bucket: "satellite-multispectral-rasters",
    sizeKB: 8400,
    uploadedAt: "2026-03-18T06:12:00Z",
    etag: "c812d4b99a01",
    url: "https://s3.hpagriculture.gov.in/satellite/ndvi-kotkhai-2026-03.tif"
  },
  {
    key: "field_photos/APP-2026-0089-goshala-inspection.jpg",
    bucket: "farmer-field-inspections",
    sizeKB: 1420,
    uploadedAt: "2026-02-18T11:45:00Z",
    etag: "e54a90cd18f2",
    url: "https://s3.hpagriculture.gov.in/field-photos/APP-2026-0089.jpg"
  }
];

module.exports = {
  getBuckets: () => mockS3Buckets,
  getFiles: (bucket) => bucket ? mockFiles.filter(f => f.bucket === bucket) : mockFiles,
  generatePresignedUploadUrl: (bucket, fileName, fileType) => {
    return {
      uploadUrl: `https://s3.hpagriculture.gov.in/${bucket}/${fileName}?signed_token=s3_sig_${Date.now()}`,
      fileKey: `${bucket}/${fileName}`,
      expiresInSeconds: 3600
    };
  }
};
