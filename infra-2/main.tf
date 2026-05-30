terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# -----------------------------
# VARIABLES
# -----------------------------

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "bucket_name" {
  description = "S3 bucket name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

# -----------------------------
# S3 BUCKET
# -----------------------------

resource "aws_s3_bucket" "site" {
  bucket = var.bucket_name

  tags = {
    Name        = var.bucket_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# -----------------------------
# OWNERSHIP CONTROLS
# -----------------------------

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# -----------------------------
# PUBLIC ACCESS BLOCK
# -----------------------------

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = true
  ignore_public_acls      = true

  # Allow bucket policy
  block_public_policy     = false
  restrict_public_buckets = false
}

# -----------------------------
# WEBSITE HOSTING
# -----------------------------

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# -----------------------------
# BUCKET POLICY
# -----------------------------

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.site.id

  depends_on = [
    aws_s3_bucket_public_access_block.site
  ]

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "PublicReadGetObject"
        Effect = "Allow"

        Principal = "*"

        Action = [
          "s3:GetObject"
        ]

        Resource = [
          "${aws_s3_bucket.site.arn}/*"
        ]
      }
    ]
  })
}

# -----------------------------
# OPTIONAL VERSIONING
# -----------------------------

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id

  versioning_configuration {
    status = "Enabled"
  }
}

# -----------------------------
# OPTIONAL SERVER SIDE ENCRYPTION
# -----------------------------

resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# -----------------------------
# OUTPUTS
# -----------------------------

output "bucket_name" {
  value = aws_s3_bucket.site.bucket
}

output "website_url" {
  value = aws_s3_bucket_website_configuration.site.website_endpoint
}

