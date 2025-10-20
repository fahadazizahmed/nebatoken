echo "This will stop and remove asfr-backend--service container, then remove wallet image and create and run new image"

echo "Stopping docker for asfr-backend--service...."
docker stop asfr-backend--service

echo "Removing docker for asfr-backend--service...."
docker rm asfr-backend--service

echo "Removing docker image for asfr-backend--service...."
docker image rm asfr-backend--service-image:latest

echo "Building docker image for asfr-backend--service...."
docker build -t asfr-backend--service-image:latest .

echo "Running docker image for asfr-backend--service...."
docker run -d \
  --name asfr-backend--service \
  --restart=always \
  -p 1900:1900 \
  --env-file .env \
  asfr-backend--service-image:latest
