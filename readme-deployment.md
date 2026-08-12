Deployment plan (summary)

This document outlines a recommended deployment setup for the URL shortener to AWS EC2 and CI/CD via GitHub Actions.

1) Build & containerization
- Two Dockerfiles are provided: backend/Dockerfile and frontend/Dockerfile.
- docker-compose.yml composes postgres + redis + backend + frontend for easy testing and single-host deploy.

2) Secrets & environment
- Do NOT store secrets in the repo. Use GitHub Actions secrets and EC2 environment (or a secrets manager).
- Required env vars: DATABASE_URL, REDIS_URL, JWT_SECRET, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB.
- For production use a managed Postgres (RDS) and managed Redis (Elasticache) when possible. Update DATABASE_URL/REDIS_URL accordingly.

3) Recommended runtime options for EC2
- Use an Ubuntu 22.04 (or Amazon Linux 2) EC2 instance with Docker and docker-compose installed.
- Create a non-root user and run containers using systemd unit or docker-compose up -d.
- For production, prefer running backend behind a reverse proxy (nginx) or use an Application Load Balancer with TLS.
- Use an external Postgres/Redis for durability and backups.

4) CI/CD (GitHub Actions) overview
- Build and test steps (on push to main or PR):
  - Install Node (frontend and backend), run lint/tests/build for each app.
  - Build images for frontend and backend and push to a container registry (e.g., AWS ECR).
  - On successful push to main, trigger a deployment job that SSHs to the EC2 instance, pulls the new images, and restarts the services with docker-compose (or uses docker stack / systemd).

- Secrets used in Actions:
  - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, ECR registry credentials
  - SSH_PRIVATE_KEY (for the deploy user on EC2) and known host fingerprint
  - DATABASE_URL, REDIS_URL, JWT_SECRET (or store in EC2 env / secrets manager)

5) Rolling update & zero-downtime
- Keep two copies of docker-compose with versioned image tags, update target tag and restart service.
- For small scale, a quick docker-compose pull && docker-compose up -d will suffice.
- For zero-downtime, consider using ECS/Fargate or Kubernetes for blue/green or rolling deployments.

6) Observability & backups
- Add logs collection (CloudWatch or a centralized ELK/Prometheus + Grafana) for backend.
- Schedule DB backups (RDS snapshots) and export Redis snapshots or use managed service snapshots.

7) Next steps / improvements
- Use ECR + ECS (or EKS) for managed deployments and better scaling.
- Add healthchecks and readiness probes to backend and configure ALB for traffic routing.
- Add automated migrations: run prisma migrate deploy at startup (careful with zero-downtime migrations).
- Add HTTPS (TLS) via a reverse proxy or AWS Certificate Manager + ALB.

Example simple GitHub Actions deploy flow (outline):
- name: Build and push images
  - Build frontend image -> frontend:sha
  - Build backend image -> backend:sha
  - Push images to ECR

- name: Deploy to EC2
  - SSH to EC2 using private key
  - docker-compose pull
  - docker-compose up -d --remove-orphans

Notes
- The provided Dockerfiles use a pragmatic approach based on the repo's current scripts. For production, compile backend TypeScript to JS and run pure node (avoid running tsx in production) and run frontend with a CDN or S3 + CloudFront for improved scalability.

If desired, can generate a matching GitHub Actions workflow file and an example systemd unit for deployment on EC2. Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
