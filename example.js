/**
 * Example usage of ProductApi
 */

const ProductApi = require('./product_api');

// Initialize API with your API key
const apikey = 'YOUR_API_KEY_HERE';
const productApi = new ProductApi(apikey);

/**
 * Example 1: Upload image from URL
 */
async function exampleUploadImageFromUrl() {
    console.log('\n=== Example 1: Upload Image from URL ===\n');
    
    try {
        const result = await productApi.uploadImage({
            imageUrl: 'https://example.com/image.jpg'
        });
        
        if (result.success) {
            console.log('Image uploaded successfully!');
            console.log('Image Path:', result.data.imagePath);
            return result.data.imagePath;
        } else {
            console.error('Failed to upload image:', result.message);
            return null;
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

/**
 * Example 2: Upload image from Base64
 */
async function exampleUploadImageFromBase64() {
    console.log('\n=== Example 2: Upload Image from Base64 ===\n');
    
    // This is just an example - in real usage, you would read the image file
    // and convert it to Base64 data URL format
    const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'; // Your base64 image here
    
    try {
        const result = await productApi.uploadImage({
            imageBase64: base64Image
        });
        
        if (result.success) {
            console.log('Image uploaded successfully!');
            console.log('Image Path:', result.data.imagePath);
            return result.data.imagePath;
        } else {
            console.error('Failed to upload image:', result.message);
            return null;
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

/**
 * Example 3: Add a new product
 */
async function exampleAddProduct() {
    console.log('\n=== Example 3: Add Product ===\n');
    
    try {
        // First, upload image (optional)
        let imagePath = null;
        // Uncomment to upload image first:
        // const uploadResult = await productApi.uploadImage({
        //     imageUrl: 'https://example.com/product-image.jpg'
        // });
        // if (uploadResult.success) {
        //     imagePath = uploadResult.data.imagePath;
        // }
        
        const result = await productApi.addProduct({
            categoryName: 'Accounts',
            subcategoryName: 'Instagram Accounts',
            sourceProductId: 'PROD-' + Date.now(),
            name: 'Instagram Account - Verified',
            subproducts: [{
                sourceProductId: 'SUB-' + Date.now(),
                sourceName: 'Instagram Account 10K Followers',
                price: 25.99,
                stock: 100,
                minQuantity: 1,
                shortDescription: 'Premium Instagram account with 10K followers'
            }],
            description: 'Verified Instagram account with 10K followers',
            image: imagePath, // Use uploaded image path if available
            warrantyDays: 7,
            active: true,
            productType: 'auto'
        });
        
        if (result.success) {
            console.log('Product added/updated successfully!');
            console.log('Product Data:', JSON.stringify(result.data, null, 2));
        } else {
            console.error('Failed to add product:', result.message);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

/**
 * Example 4: Get products list
 */
async function exampleGetProducts() {
    console.log('\n=== Example 4: Get Products ===\n');
    
    try {
        const result = await productApi.getProducts({
            productType: 'auto,manual,inventory',
            isActive: true,
            limit: 50,
            offset: 0
        });
        
        if (result.success) {
            console.log('Products retrieved successfully!');
            console.log('Total Products:', result.data.total);
            console.log('Count:', result.data.count);
            console.log('Products:', JSON.stringify(result.data.products, null, 2));
        } else {
            console.error('Failed to get products:', result.message);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

/**
 * Example 5: Delete product
 */
async function exampleDeleteProduct() {
    console.log('\n=== Example 5: Delete Product ===\n');
    
    // Replace with actual friendly ID
    const friendlyId = 1001;
    
    try {
        const result = await productApi.deleteProduct(friendlyId);
        
        if (result.success) {
            console.log('Product deleted successfully!');
            console.log('Response:', JSON.stringify(result.data, null, 2));
        } else {
            console.error('Failed to delete product:', result.message);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run examples
(async () => {
    // Uncomment the example you want to run:
    
    // await exampleUploadImageFromUrl();
    // await exampleUploadImageFromBase64();
    // await exampleAddProduct();
    // await exampleGetProducts();
    // await exampleDeleteProduct();
    
    console.log('\n=== Please uncomment the example you want to run ===\n');
    console.log('Remember to replace YOUR_API_KEY_HERE with your actual API key!\n');
})();

