## Bits
- Every middleware function needs a next , it a way to pass data to next phase of operation.

## Workflow YAML to handle .env safely

    name: Build and Deploy Docker Image
    on:
    push:
        branches:
        - main
    jobs:
    build:
        runs-on: ubuntu-latest

        steps:
        - name: Checkout code
            uses: actions/checkout@v2

        - name: Set up Docker Buildx
            uses: docker/setup-buildx-action@v1

        - name: Log in to Docker Hub
            uses: docker/login-action@v1
            with:
            username: ${{ secrets.DOCKERHUB_USERNAME }}
            password: ${{ secrets.DOCKERHUB_PASSWORD }}

        - name: Build and push Docker image
            env:
            PORT: ${{ secrets.PORT }}
            DB_HOST: ${{ secrets.DB_HOST }}
            DB_USER: ${{ secrets.DB_USER }}
            DB_PASS: ${{ secrets.DB_PASS }}
            run: |
            echo "PORT=${{ secrets.PORT }}" >> .env
            echo "DB_HOST=${{ secrets.DB_HOST }}" >> .env
            echo "DB_USER=${{ secrets.DB_USER }}" >> .env
            echo "DB_PASS=${{ secrets.DB_PASS }}" >> .env
            docker build -t your-dockerhub-username/your-image-name:latest .
            docker push your-dockerhub-username/your-image-name:latest
