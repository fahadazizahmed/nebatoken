# Create Project API Documentation

## Overview

This API endpoint allows you to create a new project with image upload. The API accepts form-data format and stores the project information in the database along with the uploaded image.

## Endpoint

```
POST /createProject
```

## Request Format

- **Content-Type**: `multipart/form-data`
- **Method**: POST

## Required Fields

### Form Data Fields

1. **projectToken** (string, required)

   - Valid token address format (0x followed by 40 hex characters)
   - Example: `0x5069C8D01536BDC204bbdA26ED10f4B9EE87A086`

2. **projectTokenAmount** (string, required)

   - Positive number representing the token amount
   - Example: `1000000000000000000000`

3. **tokenPriceUSD** (string, required)

   - Positive number representing the token price in USD
   - Example: `100000000`

4. **image** (file, required)
   - Image file (JPEG, PNG, GIF, etc.)
   - Maximum file size: 5MB
   - Supported formats: All image types

## Validations

### Field Validations

- **projectToken**: Must be a valid Ethereum address format
- **projectTokenAmount**: Must be a positive number
- **tokenPriceUSD**: Must be a positive number
- **image**: Must be an image file, maximum 5MB

### Error Responses

#### 400 Bad Request

```json
{
  "success": false,
  "message": "Missing required fields: projectToken, projectTokenAmount, tokenPriceUSD"
}
```

```json
{
  "success": false,
  "message": "Invalid project token address format"
}
```

```json
{
  "success": false,
  "message": "Project token amount must be a positive number"
}
```

```json
{
  "success": false,
  "message": "Token price USD must be a positive number"
}
```

```json
{
  "success": false,
  "message": "Image is required"
}
```

```json
{
  "success": false,
  "message": "Only image files are allowed!"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Error creating project",
  "error": "Error details"
}
```

## Success Response

### 201 Created

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "projectToken": "0x5069C8D01536BDC204bbdA26ED10f4B9EE87A086",
    "projectTokenAmount": "1000000000000000000000",
    "tokenPriceUSD": "100000000",
    "imageUrl": "/upload/image-1234567890-123456789.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Example Usage

### Using cURL

```bash
curl -X POST http://localhost:2800/createProject \
  -F "projectToken=0x5069C8D01536BDC204bbdA26ED10f4B9EE87A086" \
  -F "projectTokenAmount=1000000000000000000000" \
  -F "tokenPriceUSD=100000000" \
  -F "image=@/path/to/your/image.jpg"
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append("projectToken", "0x5069C8D01536BDC204bbdA26ED10f4B9EE87A086");
formData.append("projectTokenAmount", "1000000000000000000000");
formData.append("tokenPriceUSD", "100000000");
formData.append("image", imageFile); // File object

const response = await fetch("http://localhost:2800/createProject", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log(result);
```

### Using React/Form

```javascript
const handleSubmit = async (formData) => {
  const data = new FormData();
  data.append("projectToken", formData.projectToken);
  data.append("projectTokenAmount", formData.projectTokenAmount);
  data.append("tokenPriceUSD", formData.tokenPriceUSD);
  data.append("image", formData.image);

  try {
    const response = await fetch("http://localhost:2800/createProject", {
      method: "POST",
      body: data,
    });

    const result = await response.json();
    if (result.success) {
      console.log("Project created:", result.data);
    } else {
      console.error("Error:", result.message);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};
```

## Database Schema

The project is stored in MongoDB with the following schema:

```javascript
{
  projectToken: String (required),
  projectTokenAmount: String (required),
  tokenPriceUSD: String (required),
  imageUrl: String (required),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

## File Storage

- Images are stored in the `/upload` directory
- Files are renamed with unique timestamps to prevent conflicts
- Image URLs are accessible via `/upload/filename.jpg`
- Maximum file size: 5MB
- Supported formats: All image types

## Security Considerations

1. **File Upload Security**: Only image files are allowed
2. **File Size Limits**: 5MB maximum file size
3. **Input Validation**: All fields are validated before processing
4. **Error Handling**: Comprehensive error handling and logging

## Testing

You can test the API using the provided test script:

```bash
node test-create-project.js
```

## Notes

- The API automatically creates the upload directory if it doesn't exist
- Image URLs are relative paths that can be accessed via the server
- All timestamps are in ISO format
- The API returns detailed error messages for debugging
