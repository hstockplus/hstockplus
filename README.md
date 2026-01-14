# Hstockplus Supplier API Integration Sample - Node.js SDK

HstockPlus is a modern digital product marketplace and a reliable Hstock alternative, created to support suppliers and customers after Hstock is closed. Many former Hstock users turned to HstockPlus after the original platform went down (Hstock is down) for a secure, scalable, and fully-featured marketplace experience.

This Node.js SDK makes it easy to manage products on the hstockplus.com platform. It provides simple, well-documented methods for adding, retrieving, and deleting products via the HstockPlus API, helping both new and migrating suppliers get up and running quickly.

## Features

- ✅ **Add/Update Product** - Create new products or update existing ones
- ✅ **Get Products List** - Retrieve products with filtering options
- ✅ **Delete Product** - Remove products by friendly ID
- ✅ **Upload Image** - Upload product images from URL or Base64
- ✅ **Detailed Logging** - Comprehensive request/response logging for debugging
- ✅ **Error Handling** - Robust error handling with detailed error messages

## Installation

```bash
npm install
```

## Dependencies

- `axios` ^1.6.0 - HTTP client for making API requests

## Quick Start

```javascript
const ProductApi = require('./product_api');

// Initialize API with your API key
const apikey = 'YOUR_API_KEY_HERE';
const productApi = new ProductApi(apikey);

// Get products list
const result = await productApi.getProducts({
    productType: 'auto',
    isActive: true,
    limit: 50,
    offset: 0
});

if (result.success) {
    console.log('Products:', result.data.products);
} else {
    console.error('Error:', result.message);
}
```

## API Reference

### Constructor

#### `new ProductApi(apikey)`

Initialize the Product API client.

**Parameters:**
- `apikey` (string, required) - Your hstockplus.com API key

**Example:**
```javascript
const productApi = new ProductApi('your-api-key-here');
```

---

### Methods

#### `uploadImage(options)`

Upload an image from URL or Base64 string. Maximum image size: 5MB.

**Parameters:**
- `options` (Object)
  - `imageUrl` (string, optional) - Image URL to download and save
    - Example: `'https://example.com/image.jpg'`
  - `imageBase64` (string, optional) - Base64 encoded image (data URL format)
    - Example: `'data:image/jpeg;base64,/9j/4AAQSkZJRg...'`

**Note:** Either `imageUrl` or `imageBase64` must be provided.

**Returns:** Promise<Object>
- `success` (boolean) - Whether the request was successful
- `data` (Object) - Response data containing `imagePath`
- `status` (number) - HTTP status code
- `message` (string) - Error message if failed

**Example:**
```javascript
// Upload from URL
const result = await productApi.uploadImage({
    imageUrl: 'https://example.com/image.jpg'
});

if (result.success) {
    console.log('Image Path:', result.data.imagePath);
    // Use result.data.imagePath in addProduct()
}

// Upload from Base64
const result = await productApi.uploadImage({
    imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
});
```

---

#### `addProduct(productData)`

Add a new product or update an existing one. Products are identified by `sourceProductId` as a unique identifier.

**Parameters:**
- `productData` (Object, required)
  - `categoryName` (string, required) - Category name
    - Options: `'Accounts'`, `'Email'`, `'Proxy Services'`
  - `subcategoryName` (string, required) - Subcategory name
    - For Accounts: `'TikTok Accounts'`, `'Facebook Accounts'`, `'Twitter/X Accounts'`, `'Telegram Accounts'`, `'Instagram Accounts'`, `'Discord Accounts'`, `'Snapchat Accounts'`, `'Others'`
    - For Email: `'Gmail'`, `'Outlook'`, `'Edu Mail'`, `'Hotmail'`, `'Ru'`, `'Others'`
    - For Proxy Services: `'Residential Proxies'`, `'Mobile Proxies'`
  - `sourceProductId` (string, required) - Product ID on external source website, or supplier's internal ID (used as unique identifier)
  - `name` (string, required) - Product name
  - `subproducts` (Array<Object>, required) - Subproducts array (at least one required)
    - Each subproduct must contain:
      - `sourceProductId` (string, required) - Used to find/update existing subproduct or create new one
      - `sourceName` (string, required) - Subproduct name
      - `price` (number, required) - Price (supports up to 4 decimal places)
      - `stock` (number, required) - Stock (can be 0)
      - `minQuantity` (number, optional) - Minimum purchase quantity (default: 1)
      - `shortDescription` (string, optional) - Short description
      - `name` (string, optional) - Subproduct name
  - `sourceUrl` (string, optional) - External website product URL (auto-generated if not provided)
  - `provider` (string, optional) - Supplier name
  - `description` (string, optional) - Product description (can be plain text or HTML)
  - `descriptionText` (string, optional) - Plain text description for list page
  - `image` (string, optional) - Image path (obtained from `uploadImage()` API). If empty or null on update, this field will not be updated (existing value retained)
  - `warrantyDays` (number, optional) - Warranty days (default: 7)
  - `active` (boolean, optional) - Product active status (default: true)
  - `productType` (string, optional) - Product type (default: 'auto')
    - Options: `'auto'`, `'manual'`, `'inventory'`

**Returns:** Promise<Object>
- `success` (boolean) - Whether the request was successful
- `data` (Object) - Response data containing product information
- `status` (number) - HTTP status code
- `message` (string) - Error message if failed

**Example:**
```javascript
const result = await productApi.addProduct({
    categoryName: 'Accounts',
    subcategoryName: 'Instagram Accounts',
    sourceProductId: 'PROD-123456',
    name: 'Instagram Account - Verified',
    subproducts: [{
        sourceProductId: 'SUB-123456',
        sourceName: 'Instagram Account 10K Followers',
        price: 25.99,
        stock: 100,
        minQuantity: 1,
        shortDescription: 'Premium Instagram account with 10K followers'
    }],
    description: 'Verified Instagram account with 10K followers',
    image: '/uploads/image-1234567890-123456789.webp',
    warrantyDays: 7,
    active: true,
    productType: 'auto'
});

if (result.success) {
    console.log('Product added/updated successfully!');
    console.log('Product ID:', result.data.productId);
    console.log('Friendly ID:', result.data.friendlyId);
} else {
    console.error('Failed to add product:', result.message);
}
```

**Note:** If a product with the same `sourceProductId` already exists, it will be updated instead of creating a new one.

---

#### `getProducts(options)`

Get products list with filtering options.

**Parameters:**
- `options` (Object, optional)
  - `productType` (string, optional) - Product type (default: `'auto'`)
    - Can be: `'auto'`, `'manual'`, `'inventory'`
    - Or comma-separated: `'auto,manual,inventory'`
  - `isActive` (boolean, optional) - Whether active (default: `true`)
  - `limit` (number, optional) - Items per page (default: `50`)
  - `offset` (number, optional) - Offset for pagination (default: `0`)

**Returns:** Promise<Object>
- `success` (boolean) - Whether the request was successful
- `data` (Object) - Response data containing:
  - `products` (Array) - Array of product objects
  - `count` (number) - Number of products in current page
  - `total` (number) - Total number of products
- `status` (number) - HTTP status code
- `message` (string) - Error message if failed

**Example:**
```javascript
// Get all active auto products
const result = await productApi.getProducts({
    productType: 'auto',
    isActive: true,
    limit: 50,
    offset: 0
});

if (result.success) {
    console.log('Total Products:', result.data.total);
    console.log('Products:', result.data.products);
    
    // Iterate through products
    result.data.products.forEach(product => {
        console.log(`Product: ${product.name} (ID: ${product.id})`);
        console.log(`Subproducts: ${product.subproducts.length}`);
    });
} else {
    console.error('Failed to get products:', result.message);
}

// Get all product types
const result = await productApi.getProducts({
    productType: 'auto,manual,inventory',
    isActive: true,
    limit: 100
});
```

**Product Object Structure:**
```javascript
{
    id: "product_id",
    friendlyId: 1001,
    name: "Instagram Account - Verified",
    description: "Verified Instagram account with 10K followers",
    image: "/uploads/image-1234567890-123456789.webp",
    provider: "MyProvider",
    sourceProductId: "prod_123",
    sourceUrl: "MyProvider_prod_123",
    productType: "auto",
    isActive: true,
    category: {
        id: "category_id",
        name: "Accounts",
        slug: "accounts"
    },
    subcategory: {
        id: "subcategory_id",
        name: "Instagram Accounts",
        slug: "instagram-accounts"
    },
    subproducts: [
        {
            id: "subproduct_id",
            name: "Gmail Account",
            sourceName: "Gmail USA 2-5 MONTHS",
            price: 25,
            stock: 50,
            minQuantity: 1,
            sourceProductId: "sp_123",
            isActive: true,
            shortDescription: "Premium Gmail account"
        }
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
}
```

---

#### `deleteProduct(friendlyId)`

Delete a product by friendly ID.

**Parameters:**
- `friendlyId` (number|string, required) - Product friendly ID

**Returns:** Promise<Object>
- `success` (boolean) - Whether the request was successful
- `data` (Object) - Response data containing:
  - `success` (boolean)
  - `message` (string)
  - `friendlyId` (number)
  - `productId` (string)
- `status` (number) - HTTP status code
- `message` (string) - Error message if failed

**Example:**
```javascript
const result = await productApi.deleteProduct(1001);

if (result.success) {
    console.log('Product deleted successfully!');
    console.log('Deleted Product ID:', result.data.productId);
    console.log('Deleted Friendly ID:', result.data.friendlyId);
} else {
    console.error('Failed to delete product:', result.message);
}
```

---

## Error Handling

All methods return a result object with a `success` property. Always check `result.success` before accessing `result.data`.

```javascript
const result = await productApi.getProducts();

if (result.success) {
    // Handle success
    console.log('Data:', result.data);
} else {
    // Handle error
    console.error('Error:', result.message);
    console.error('Status Code:', result.status);
    console.error('Error Details:', result.error);
}
```

## Logging

The SDK provides detailed logging for all API requests and responses:

- Request method, URL, headers, and body
- Response status, data, and duration
- Error details if request fails

All logs are printed to the console. API keys are partially masked in logs for security.

## Complete Example

```javascript
const ProductApi = require('./product_api');

async function main() {
    const apikey = 'YOUR_API_KEY_HERE';
    const productApi = new ProductApi(apikey);

    try {
        // 1. Upload image
        console.log('Step 1: Uploading image...');
        const uploadResult = await productApi.uploadImage({
            imageUrl: 'https://example.com/product-image.jpg'
        });
        
        if (!uploadResult.success) {
            console.error('Failed to upload image:', uploadResult.message);
            return;
        }
        
        const imagePath = uploadResult.data.imagePath;
        console.log('Image uploaded:', imagePath);

        // 2. Add product
        console.log('\nStep 2: Adding product...');
        const addResult = await productApi.addProduct({
            categoryName: 'Accounts',
            subcategoryName: 'Instagram Accounts',
            sourceProductId: 'PROD-' + Date.now(),
            name: 'Instagram Account - Verified',
            subproducts: [{
                sourceProductId: 'SUB-' + Date.now(),
                sourceName: 'Instagram Account 10K Followers',
                price: 25.99,
                stock: 100,
                minQuantity: 1
            }],
            description: 'Verified Instagram account with 10K followers',
            image: imagePath,
            warrantyDays: 7,
            active: true
        });

        if (!addResult.success) {
            console.error('Failed to add product:', addResult.message);
            return;
        }

        console.log('Product added successfully!');
        console.log('Product ID:', addResult.data.productId);

        // 3. Get products
        console.log('\nStep 3: Getting products...');
        const getResult = await productApi.getProducts({
            productType: 'auto',
            isActive: true,
            limit: 10
        });

        if (getResult.success) {
            console.log(`Found ${getResult.data.count} products`);
            getResult.data.products.forEach(product => {
                console.log(`- ${product.name} (ID: ${product.id})`);
            });
        }

        // 4. Delete product (example)
        // console.log('\nStep 4: Deleting product...');
        // const deleteResult = await productApi.deleteProduct(1001);
        // if (deleteResult.success) {
        //     console.log('Product deleted successfully!');
        // }

    } catch (error) {
        console.error('Unexpected error:', error.message);
    }
}

main();
```

## Category and Subcategory Reference

### Accounts Category
- TikTok Accounts
- Facebook Accounts
- Twitter/X Accounts
- Telegram Accounts
- Instagram Accounts
- Discord Accounts
- Snapchat Accounts
- Others

### Email Category
- Gmail
- Outlook
- Edu Mail
- Hotmail
- Ru
- Others

### Proxy Services Category
- Residential Proxies
- Mobile Proxies

## Notes

- **Price**: Supports up to 4 decimal places (e.g., 25.1234)
- **Stock**: Can be set to 0 (product will be disabled)
- **Image**: Maximum size is 5MB. Supported formats: JPG, PNG, GIF, WebP, SVG
- **Product Update**: Products are identified by `sourceProductId`. If a product with the same `sourceProductId` exists, it will be updated instead of creating a new one.
- **Subproducts**: Each product must have at least one subproduct. Subproducts are also identified by their `sourceProductId`.

## License

MIT

## Support

For API documentation and support, visit: https://hstockplus.com


