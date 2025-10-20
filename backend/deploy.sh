echo "This will stop and remove neba-backend--service container, then remove wallet image and create and run new image"

echo "Stopping docker for neba-backend--service...."
docker stop neba-backend--service

echo "Removing docker for neba-backend--service...."
docker rm neba-backend--service

echo "Removing docker image for neba-backend--service...."
docker image rm neba-backend--service-image:latest

echo "Building docker image for neba-backend--service...."
docker build -t neba-backend--service-image:latest .

echo "Running docker image for neba-backend--service...."
docker run -d \
  --name neba-backend--service \
  --restart=always \
  -p 1900:1900 \
  --env-file .env \
  neba-backend--service-image:latest
