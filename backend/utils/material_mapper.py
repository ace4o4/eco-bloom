"""
Material categorization utilities for YOLOv5 detections
Maps detected objects to material categories and recyclability
"""

# Material category mapping
MATERIAL_CATEGORIES = {
    'bottle': 'plastic',
    'cup': 'plastic',
    'bowl': 'plastic',
    'cell phone': 'electronics',
    'laptop': 'electronics',
    'keyboard': 'electronics',
    'mouse': 'electronics',
    'remote': 'electronics',
    'tv': 'electronics',
    'book': 'paper',
    'scissors': 'metal',
    'spoon': 'metal',
    'fork': 'metal',
    'knife': 'metal',
    'toothbrush': 'plastic',
    'hair drier': 'electronics',
    'clock': 'electronics',
    'vase': 'glass',
    'wine glass': 'glass',
    'potted plant': 'organic',
    'chair': 'textiles',
    'couch': 'textiles',
    'bed': 'textiles',
    'backpack': 'textiles',
    'handbag': 'textiles',
    'tie': 'textiles',
    'suitcase': 'textiles',
    'banana': 'organic',
    'apple': 'organic',
    'orange': 'organic',
    'broccoli': 'organic',
    'carrot': 'organic',
    'pizza': 'organic',
    'donut': 'organic',
    'cake': 'organic',
}

# Recyclable items
RECYCLABLE_ITEMS = {
    'bottle', 'cup', 'bowl', 'book', 'cell phone', 
    'laptop', 'keyboard', 'mouse', 'scissors', 'spoon', 
    'fork', 'knife', 'vase', 'wine glass', 'backpack',
    'handbag', 'suitcase', 'tv', 'remote'
}

# Weight estimates (in grams)
WEIGHT_ESTIMATES = {
    'bottle': '50g',
    'cup': '30g',
    'bowl': '200g',
    'cell phone': '150g',
    'laptop': '2kg',
    'keyboard': '800g',
    'mouse': '100g',
    'remote': '120g',
    'book': '500g',
    'scissors': '100g',
    'spoon': '50g',
    'fork': '40g',
    'knife': '80g',
    'vase': '300g',
    'wine glass': '150g',
    'backpack': '800g',
    'handbag': '500g',
    'suitcase': '3kg',
    'clock': '200g',
    'banana': '120g',
    'apple': '150g',
    'orange': '130g',
    'tv': '10kg',
    'hair drier': '600g',
    'toothbrush': '20g',
}


def get_material_info(detected_class: str, confidence: float) -> dict:
    """
    Get material information for a detected object
    
    Args:
        detected_class: The class name detected by YOLOv5
        confidence: Detection confidence score (0-1)
    
    Returns:
        Dictionary with material information
    """
    detected_class = detected_class.lower()
    
    # Get category
    category = MATERIAL_CATEGORIES.get(detected_class, 'other')
    
    # Check if recyclable
    is_recyclable = detected_class in RECYCLABLE_ITEMS
    
    # Generate title
    title_words = detected_class.split(' ')
    title = ' '.join(word.capitalize() for word in title_words)
    title = f"{title} for {'recycling' if is_recyclable else 'reuse'}"
    
    # Generate description
    condition = 'good' if confidence > 0.8 else 'fair' if confidence > 0.6 else 'acceptable'
    recycle_text = 'Recyclable item' if is_recyclable else 'Can be reused or repurposed'
    description = f"{title.split(' for ')[0]} in {condition} condition. {recycle_text}."
    if category != 'other':
        description += f" Category: {category}."
    
    # Get weight estimate
    estimated_weight = WEIGHT_ESTIMATES.get(detected_class, '100g')
    
    return {
        'materialType': title.split(' for ')[0],
        'title': title[:50],  # Limit to 50 chars
        'description': description[:150],  # Limit to 150 chars
        'isRecyclable': is_recyclable,
        'suggestedCategory': category,
        'confidence': round(confidence, 2),
        'estimatedWeight': estimated_weight
    }


def format_detection_response(detections: list) -> dict:
    """
    Format YOLOv5 detections into response format
    
    Args:
        detections: List of detection results from YOLOv5
    
    Returns:
        Formatted response dictionary
    """
    if not detections or len(detections) == 0:
        return {
            'success': True,
            'detections': [],
            'material': {
                'materialType': 'Unknown Material',
                'title': 'Material for recycling',
                'description': 'No specific object detected. Please provide details manually.',
                'isRecyclable': False,
                'suggestedCategory': 'other',
                'confidence': 0.0,
                'estimatedWeight': '100g'
            }
        }
    
    # Get best detection (highest confidence)
    best_detection = max(detections, key=lambda x: x['confidence'])
    
    # Get material info
    material_info = get_material_info(
        best_detection['class'],
        best_detection['confidence']
    )
    
    return {
        'success': True,
        'detections': detections,
        'material': material_info
    }
