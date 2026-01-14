/**
 * Product API - Manage products via API key
 * Based on hstockplus.com API
 * 
 * Features:
 * - Add/Update Product
 * - Get Products List
 * - Delete Product
 * - Upload Image
 */

const axios = require('axios');

class ProductApi {
    /**
     * Initialize Product API
     * @param {string} apikey - API key
     */
    constructor(apikey) {
        if (!apikey) {
            throw new Error('apikey is required');
        }
        this.apikey = apikey;
        this.baseUrl = 'https://hstockplus.com/api/admin/v2';
    }

    /**
     * Get request headers
     * @returns {Object} Request headers object
     */
    getHeader() {
        return {
            'X-Api-Key': this.apikey,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Send HTTP request
     * @param {string} method - HTTP method (GET, POST, DELETE, etc.)
     * @param {string} url - Request URL
     * @param {Object} headers - Request headers
     * @param {Object} data - Request data (used for POST/PATCH)
     * @param {Object} params - Query parameters (used for GET)
     * @returns {Promise<Object>} Response data
     */
    async request(method, url, headers = {}, data = null, params = null) {
        const startTime = Date.now();
        
        // Build full URL with query parameters for logging
        let fullUrl = url;
        if (params && Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            fullUrl += (url.includes('?') ? '&' : '?') + queryString;
        }

        // Print request log
        console.log('\n========== Request Log ==========');
        console.log(`[${new Date().toISOString()}] ${method} ${fullUrl}`);
        console.log('--- Request Headers ---');
        // Hide sensitive information (API Key)
        const safeHeaders = { ...headers };
        if (safeHeaders['X-Api-Key']) {
            const apiKey = safeHeaders['X-Api-Key'];
            safeHeaders['X-Api-Key'] = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
        }
        console.log(JSON.stringify(safeHeaders, null, 2));
        
        if (params && Object.keys(params).length > 0) {
            console.log('--- Query Parameters ---');
            console.log(JSON.stringify(params, null, 2));
        }
        
        if (data) {
            console.log('--- Request Body ---');
            console.log(JSON.stringify(data, null, 2));
        }
        console.log('==============================\n');

        try {
            // Configure axios request
            const config = {
                method: method,
                url: url,
                headers: headers,
                timeout: 30000 // 30 seconds timeout
            };

            // Add params for GET requests
            if (params && Object.keys(params).length > 0) {
                config.params = params;
            }

            // Add data for POST/PATCH/PUT requests
            if (data) {
                config.data = data;
            }

            // Send request
            const response = await axios(config);
            const duration = Date.now() - startTime;
            const responseSize = Buffer.byteLength(JSON.stringify(response.data), 'utf8');
            
            // Print response log
            console.log('\n========== Response Log ==========');
            console.log(`[${new Date().toISOString()}] Response Time: ${duration}ms`);
            console.log(`Status Code: ${response.status}`);
            console.log(`Response Size: ${(responseSize / 1024).toFixed(2)} KB`);
            console.log('--- Response Data ---');
            console.log(JSON.stringify(response.data, null, 2));
            console.log('==================================\n');

            return {
                success: true,
                status: response.status,
                data: response.data,
                duration: duration
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            
            // Print error log
            console.log('\n========== Error Log ==========');
            console.log(`[${new Date().toISOString()}] Request Failed after ${duration}ms`);
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(`Status Code: ${error.response.status}`);
                console.log('--- Error Response ---');
                console.log(JSON.stringify(error.response.data, null, 2));
                console.log('============================\n');
                
                return {
                    success: false,
                    status: error.response.status,
                    error: error.response.data,
                    message: error.response.data?.message || error.response.data?.error || 'Request failed',
                    duration: duration
                };
            } else if (error.request) {
                // The request was made but no response was received
                console.log('No response received from server');
                console.log('Error:', error.message);
                console.log('============================\n');
                
                return {
                    success: false,
                    status: null,
                    error: 'No response received',
                    message: error.message || 'Network error or server timeout',
                    duration: duration
                };
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Request setup error:', error.message);
                console.log('============================\n');
                
                return {
                    success: false,
                    status: null,
                    error: 'Request setup error',
                    message: error.message,
                    duration: duration
                };
            }
        }
    }

    /**
     * Upload image (from URL or Base64 string)
     * Maximum image size: 5MB
     * Returns image path for product creation
     * 
     * @param {Object} options - Upload options
     * @param {string} [options.imageUrl] - Image URL to download and save
     *   Example: https://example.com/image.jpg
     * @param {string} [options.imageBase64] - Base64 encoded image (data URL format)
     *   Example: data:image/jpeg;base64,/9j/4AAQSkZJRg...
     * @returns {Promise<Object>} Response with imagePath
     * 
     * @example
     * // Upload from URL
     * const result = await productApi.uploadImage({
     *   imageUrl: 'https://example.com/image.jpg'
     * });
     * 
     * @example
     * // Upload from Base64
     * const result = await productApi.uploadImage({
     *   imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
     * });
     */
    async uploadImage(options = {}) {
        const { imageUrl, imageBase64 } = options;
        
        if (!imageUrl && !imageBase64) {
            throw new Error('Either imageUrl or imageBase64 must be provided');
        }

        const url = `${this.baseUrl}/upload-image`;
        const payload = {};
        
        if (imageUrl) {
            payload.imageUrl = imageUrl;
        }
        if (imageBase64) {
            payload.imageBase64 = imageBase64;
        }

        return await this.request('POST', url, this.getHeader(), payload);
    }

    /**
     * Add or update product
     * Products are identified by sourceProductId as a unique identifier
     * 
     * @param {Object} productData - Product data
     * @param {string} productData.categoryName - Category name (required, used when creating new category, cannot be modified on update)
     * @param {string} productData.subcategoryName - Subcategory name (required, used when creating new category, cannot be modified on update)
     * @param {string} productData.sourceProductId - Product ID on external source website, or supplier's internal ID (required, used as unique identifier)
     * @param {string} productData.name - Product name (required)
     * @param {Array<Object>} productData.subproducts - Subproducts array (required, at least one required)
     *   Each subproduct must contain:
     *   - sourceProductId (required): Used to find/update existing subproduct or create new one
     *   - sourceName (required): Subproduct name
     *   - price (required): Price
     *   - stock (required): Stock (set to 0 to disable)
     *   Optional fields:
     *   - name: Subproduct name
     *   - minQuantity (default: 1): Minimum purchase quantity
     *   - shortDescription: Short description
     * @param {string} [productData.sourceUrl] - External website product URL (optional, auto-generated as provider + "_" + sourceProductId if not provided)
     * @param {string} [productData.provider] - Supplier name (optional)
     * @param {string} [productData.description] - Product description (optional, can be plain text or HTML)
     * @param {string} [productData.descriptionText] - Plain text description for list page (optional)
     * @param {string} [productData.image] - Image path (obtained from upload-image API). If empty or null on update, this field will not be updated (existing value retained)
     * @param {number} [productData.warrantyDays=7] - Warranty days, default 7
     * @param {boolean} [productData.active=true] - Product active status, default true
     * @param {string} [productData.productType] - Product type (default: auto). Options: auto, manual, inventory
     * @returns {Promise<Object>} Response data
     * 
     * @example
     * const result = await productApi.addProduct({
     *   categoryName: 'Accounts',
     *   subcategoryName: 'Instagram Accounts',
     *   sourceProductId: 'PROD-123456',
     *   name: 'Instagram Account - Verified',
     *   subproducts: [{
     *     sourceProductId: 'SUB-123456',
     *     sourceName: 'Instagram Account 10K',
     *     price: 25.99,
     *     stock: 100,
     *     minQuantity: 1
     *   }],
     *   description: 'Verified Instagram account with 10K followers',
     *   image: '/uploads/image-1234567890-123456789.webp'
     * });
     */
    async addProduct(productData) {
        const {
            categoryName,
            subcategoryName,
            sourceProductId,
            name,
            subproducts,
            sourceUrl,
            provider,
            description,
            descriptionText,
            image,
            warrantyDays = 7,
            active = true,
            productType
        } = productData;

        // Validate required fields
        if (!categoryName) {
            throw new Error('categoryName is required');
        }
        if (!subcategoryName) {
            throw new Error('subcategoryName is required');
        }
        if (!sourceProductId) {
            throw new Error('sourceProductId is required');
        }
        if (!name) {
            throw new Error('name is required');
        }
        if (!subproducts || !Array.isArray(subproducts) || subproducts.length === 0) {
            throw new Error('subproducts is required and must contain at least one subproduct');
        }

        // Validate subproducts
        for (const subproduct of subproducts) {
            if (!subproduct.sourceProductId) {
                throw new Error('subproduct.sourceProductId is required');
            }
            if (!subproduct.sourceName) {
                throw new Error('subproduct.sourceName is required');
            }
            if (subproduct.price === undefined || subproduct.price === null) {
                throw new Error('subproduct.price is required');
            }
            if (subproduct.stock === undefined || subproduct.stock === null) {
                throw new Error('subproduct.stock is required');
            }
        }

        const url = `${this.baseUrl}/products`;
        const payload = {
            categoryName,
            subcategoryName,
            sourceProductId,
            name,
            subproducts
        };

        // Add optional fields
        if (sourceUrl) {
            payload.sourceUrl = sourceUrl;
        }
        if (provider) {
            payload.provider = provider;
        }
        if (description) {
            payload.description = description;
        }
        if (descriptionText) {
            payload.descriptionText = descriptionText;
        }
        if (image) {
            payload.image = image;
        }
        if (warrantyDays !== undefined) {
            payload.warrantyDays = warrantyDays;
        }
        if (active !== undefined) {
            payload.active = active;
        }
        if (productType) {
            payload.productType = productType;
        }

        return await this.request('POST', url, this.getHeader(), payload);
    }

    /**
     * Get products list
     * 
     * @param {Object} [options] - Query options
     * @param {string} [options.productType='auto'] - Product type, default 'auto'
     *   Can be: 'auto', 'manual', 'inventory', or comma-separated like 'auto,manual,inventory'
     * @param {boolean} [options.isActive=true] - Whether active, default true
     * @param {number} [options.limit=50] - Items per page, default 50
     * @param {number} [options.offset=0] - Offset, default 0
     * @returns {Promise<Object>} Response with products list
     * 
     * @example
     * // Get all active auto products
     * const result = await productApi.getProducts({
     *   productType: 'auto',
     *   isActive: true,
     *   limit: 50,
     *   offset: 0
     * });
     * 
     * @example
     * // Get all product types
     * const result = await productApi.getProducts({
     *   productType: 'auto,manual,inventory',
     *   isActive: true
     * });
     */
    async getProducts(options = {}) {
        const {
            productType = 'auto',
            isActive = true,
            limit = 50,
            offset = 0
        } = options;

        const url = `${this.baseUrl}/products`;
        const params = {
            productType: productType,
            isActive: isActive.toString().toLowerCase(),
            limit: limit,
            offset: offset
        };

        return await this.request('GET', url, this.getHeader(), null, params);
    }

    /**
     * Delete product by friendly ID
     * 
     * @param {number|string} friendlyId - Product friendly ID
     * @returns {Promise<Object>} Response data
     * 
     * @example
     * const result = await productApi.deleteProduct(1001);
     * 
     * @example
     * const result = await productApi.deleteProduct('1001');
     */
    async deleteProduct(friendlyId) {
        if (!friendlyId) {
            throw new Error('friendlyId is required');
        }

        const url = `${this.baseUrl}/products/${friendlyId}`;
        return await this.request('DELETE', url, this.getHeader());
    }
}

module.exports = ProductApi;

