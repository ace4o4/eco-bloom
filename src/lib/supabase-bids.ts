
import { supabase } from './supabase';

export interface Bid {
    id: string;
    listing_id: string;
    bidder_id: string;
    amount: number;
    created_at: string;
    status: 'pending' | 'accepted' | 'rejected';
    bidder: {
        full_name: string;
        email?: string; 
        avatar_url?: string;
    };
}

export async function acceptBid(bidId: string, listingId: string) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to accept a bid');
    }

    // Update the specific bid to accepted
    const { error } = await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId)
        .eq('listing_id', listingId); // Extra safety check

    if (error) {
        console.error('Error accepting bid:', error);
        throw error;
    }

    // Optional: Reject all other bids? 
    // For now, we will just mark this one as accepted. 
    // The UI will lock based on *any* accepted bid.
}

export async function placeBid(listingId: string, amount: number) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to place a bid');
    }

    // Use upsert to allow updating existing bids
    const { data, error } = await supabase
        .from('bids')
        .upsert({
            listing_id: listingId,
            bidder_id: user.id,
            amount: amount,
            created_at: new Date().toISOString() // Update timestamp on edit
        }, { onConflict: 'listing_id, bidder_id' })
        .select()
        .single();

    if (error) {
        console.error('Error placing/updating bid:', error);
        throw error;
    }

    return data;
}

export async function getBidsForListing(listingId: string): Promise<Bid[]> {
    // Step 1: Fetch bids without joining (to avoid FK errors if schema is imperfect)
    const { data: bids, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('listing_id', listingId)
        .order('amount', { ascending: false });

    if (bidsError) {
        console.error('Error fetching bids:', bidsError);
        return [];
    }

    if (!bids || bids.length === 0) return [];

    // Step 2: Extract unique bidder IDs
    const bidderIds = Array.from(new Set(bids.map(b => b.bidder_id))).filter(Boolean);

    // Step 3: Fetch profiles for these bidders
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', bidderIds);
    
    if (profilesError) {
        console.warn('Error fetching profiles, falling back to anonymous:', profilesError);
    }

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Step 4: Merge data
    return bids.map((bid: any) => ({
        ...bid,
        bidder: {
            full_name: profileMap.get(bid.bidder_id)?.full_name || 'Anonymous User',
            avatar_url: profileMap.get(bid.bidder_id)?.avatar_url,
            email: 'Hidden'
        }
    }));
}

export async function getHighestBid(listingId: string): Promise<number | null> {
    const { data, error } = await supabase
        .from('bids')
        .select('amount')
        .eq('listing_id', listingId)
        .order('amount', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching highest bid:', error);
        return null;
    }

    return data && data.length > 0 ? data[0].amount : null;
}
