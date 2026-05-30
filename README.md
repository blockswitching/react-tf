# react-app

A React + Three.js landing page deployed to AWS S3 as a static website, provisioned with Terraform.

---

## Prerequisites

Make sure the following are installed before you begin:

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | >= 18 | Run the React app |
| [npm](https://www.npmjs.com/) | >= 9 | Install dependencies |
| [Terraform](https://developer.hashicorp.com/terraform/install) | >= 1.5.0 | Provision AWS infrastructure |
| [AWS CLI](https://aws.amazon.com/cli/) | v2 | Upload files to S3 |
| AWS Account | — | Target deployment environment |

---

## Project Structure

```
react-tf/
├── my-app/          # React + Vite frontend
│   ├── src/
│   │   └── components/
│   │       └── LandingPage.tsx
│   └── package.json
├── infra-2/         # Terraform infrastructure
│   └── main.tf      # S3 bucket, website config, IAM policy
└── .gitignore
```

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/blockswitching/react-tf.git
cd react-tf
```

---

## Step 2 — Install Frontend Dependencies

```bash
cd my-app
npm install
```

---

## Step 3 — Run the Development Server (Optional)

Preview the app locally before deploying:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. Press `Ctrl+C` to stop.

---

## Step 4 — Configure AWS Credentials

The AWS CLI must be authenticated before Terraform and deployment can run.

```bash
aws configure
```

Enter when prompted:

- **AWS Access Key ID** — from your IAM user
- **AWS Secret Access Key** — from your IAM user
- **Default region name** — `ap-south-1` (or your preferred region)
- **Default output format** — `json`

Verify it works:

```bash
aws sts get-caller-identity
```

---

## Step 5 — Provision Infrastructure with Terraform

Navigate to the Terraform directory:

```bash
cd ../infra-2
```

### 5a — Initialize Terraform

Downloads the required AWS provider plugin:

```bash
terraform init
```

### 5b — Create a Variables File

Create a file named `terraform.tfvars` in `infra-2/`:

```hcl
bucket_name = "your-unique-bucket-name"
aws_region  = "ap-south-1"
environment = "prod"
```

> The bucket name must be globally unique across all of AWS.

### 5c — Preview the Plan

Review what Terraform will create:

```bash
terraform plan
```

### 5d — Apply the Infrastructure

Create the S3 bucket and all related resources:

```bash
terraform apply
```

Type `yes` when prompted. When complete, Terraform will output:

```
bucket_name = "your-unique-bucket-name"
website_url = "your-unique-bucket-name.s3-website.ap-south-1.amazonaws.com"
```

Copy the `website_url` — you will need it after deployment.

---

## Step 6 — Build the Frontend

Go back to `my-app` and build the production bundle:

```bash
cd ../my-app
npm run build
```

This creates a `dist/` folder containing the compiled static files.

---

## Step 7 — Deploy to S3

Upload the built files to your S3 bucket:

```bash
aws s3 sync dist/ s3://your-unique-bucket-name --delete
```

Replace `your-unique-bucket-name` with the value from Step 5d.

The `--delete` flag removes any files from S3 that no longer exist in `dist/`.

---

## Step 8 — Visit Your Site

Open the `website_url` from Step 5d in your browser:

```
http://your-unique-bucket-name.s3-website.ap-south-1.amazonaws.com
```

---

## Re-deploying After Changes

After editing the frontend, just rebuild and sync:

```bash
cd my-app
npm run build
aws s3 sync dist/ s3://your-unique-bucket-name --delete
```

---

## Tear Down

To delete all AWS resources created by Terraform:

```bash
cd infra-2
terraform destroy
```

Type `yes` when prompted. Note: the S3 bucket must be empty before Terraform can destroy it. Empty it first:

```bash
aws s3 rm s3://your-unique-bucket-name --recursive
terraform destroy
```
