/**
 * Supabase Listings Service
 * CRUD operations for material listings
 */

import { supabase } from './supabase';

export interface Listing {
    id?: string;
    user_id?: string;
    type: 'offering' | 'seeking';
    title: string;
    description: string;
    category: string;
    quantity: string;
    unit: string;
    location_lat?: number | null;
    location_lng?: number | null;
    location_address?: string;
    image_url?: string;
    frequency?: string;
    status?: 'active' | 'completed' | 'cancelled';
    created_at?: string;
    updated_at?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
}

export interface SearchFilters {
    query?: string;
    category?: string;
    location?: {
        lat: number;
        lng: number;
    };
    radius?: number; // in km
}

/**
 * Create a new listing
 */
export async function createListing(listing: Listing): Promise<Listing> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User must be authenticated to create listings');
    }

    // Get category_id from category slug/name
    let category_id = null;
    if (listing.category) {
        const { data: categoryData } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', listing.category)
            .single();

        if (categoryData) {
            category_id = categoryData.id;
        } else {
            // Fallback: use 'other' or first category
            const { data: defaultCat } = await supabase
                .from('categories')
                .select('id')
                .limit(1)
                .single();
            category_id = defaultCat?.id;
        }
    }

    const listingData = {
        type: listing.type,
        category_id: category_id,
        title: listing.title,
        description: listing.description,
        quantity: parseFloat(listing.quantity),
        unit: listing.unit,
        frequency: listing.frequency || 'one-time',
        location: listing.location_address || '',
        location_lat: listing.location_lat,
        location_lng: listing.location_lng,
        location_address: listing.location_address,
        image_url: listing.image_url,
        contact_name: user.email?.split('@')[0] || 'Anonymous',
        contact_email: user.email,
        contact_phone: null,
        user_id: user.id,
        status: 'active',
    };

    console.log('🔍 DEBUG - Listing data being sent:', listingData);
    console.log('🔍 DEBUG - Unit value:', listingData.unit, 'Type:', typeof listingData.unit);

    const { data, error } = await supabase
        .from('listings')
        .insert([listingData])
        .select()
        .single();

    if (error) {
        console.error('Error creating listing:', error);
        throw error;
    }

    return data;
}

/**
 * Fetch listings with filters
 */
export async function fetchListings(filters: SearchFilters = {}): Promise<Listing[]> {
    let query = supabase
        .from('listings')
        .select(`
            *,
            categories (
                slug
            )
        `)
        .eq('type', 'offering')
        .eq('status', 'active');

    // Text search
    if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
    }

    // Location-based search
    if (filters.location && filters.radius) {
        const { data, error } = await supabase.rpc('listings_within_radius', {
            lat: filters.location.lat,
            lng: filters.location.lng,
            radius_km: filters.radius,
        });

        if (error) {
            console.error('Error fetching listings with radius:', error);
            throw error;
        }

        return (data || []).map((listing: Record<string, unknown>) => ({
            ...listing,
            category: (listing.categories as { slug?: string })?.slug || 'other',
        })) as Listing[];
    }

    // Default query without location
    query = query.order('created_at', { ascending: false }).limit(50);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching listings:', error);
        throw error;
    }

    // Transform data to include category slug
    return (data || []).map((listing: Record<string, unknown>) => ({
        ...listing,
        category: (listing.categories as { slug?: string })?.slug || 'other',
    })) as Listing[];
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadListingImage(file: File | Blob): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User must be authenticated to upload images');
    }

    // Generate unique filename
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Error uploading image:', error);
        throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(data.path);

    return publicUrl;
}

/**
 * Upload base64 image to Supabase Storage
 */
export async function uploadListingImageFromBase64(base64Data: string): Promise<string> {
    // Convert base64 to blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();

    return uploadListingImage(blob);
}

/**
 * Update a listing
 */
export async function updateListing(id: string, updates: Partial<Listing>): Promise<Listing> {
    const { data, error } = await supabase
        .from('listings')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating listing:', error);
        throw error;
    }

    return data;
}

/**
 * Delete a listing
 */
export async function deleteListing(id: string): Promise<void> {
    const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting listing:', error);
        throw error;
    }
}

/**
 * Get user's own listings
 */
export async function getMyListings(): Promise<Listing[]> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user listings:', error);
        throw error;
    }

    return data || [];
}
