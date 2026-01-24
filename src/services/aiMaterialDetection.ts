/**
 * AI Material Detection Service
 * Connects to YOLOv5 Backend API for object detection
 */

const API_URL = 'https://ace4o4-eco-bloom.hf.space';

export interface MaterialDetectionResult {
    materialType: string;
    title: string;
    description: string;
    isRecyclable: boolean;
    suggestedCategory: string;
    confidence: number;
    estimatedWeight?: string;
    primary_detection?: {
        title: string;
        description: string;
        market_price?: {
            min: number;
            max: number;
            avg: number;
            unit: string;
            recommended_min: number;
        };
    };
}

/**
 * Analyze image using YOLOv5 backend API
 */
export async function analyzeMaterialImage(imageDataUrl: string): Promise<MaterialDetectionResult> {
    try {
        console.log('🤖 Starting AI detection (YOLOv5 Backend)...');
        console.log(`� API URL: ${API_URL}/detect`);

        // Send image to backend
        const response = await fetch(`${API_URL}/detect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageDataUrl
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📥 API Response:', data);

        if (!data.success || !data.material) {
            throw new Error('Invalid response from API');
        }

        const result = data.material;
        console.log('✅ Detected:', result.materialType);
        console.log('♻️ Recyclable:', result.isRecyclable);
        console.log('🎯 Confidence:', (result.confidence * 100).toFixed(0) + '%');

        return result;

    } catch (error) {
        console.error('❌ AI detection error:', error);

        // Check if backend is running
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Backend API not running. Please start the Python server first.');
        }

        throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Check if backend API is healthy
 */
export async function checkAPIHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        return data.status === 'healthy';
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
}
