import { supabase } from './supabase';

export interface ChatMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    image_url?: string;
    is_read: boolean;
    created_at: string;
}

export interface Conversation {
    id: string;
    listing_id: string;
    buyer_id: string;
    seller_id: string;
    last_message_at: string;
    unread_count?: number;
    listing?: {
        title: string;
        image_url: string;
        contact_name?: string;
    };
    other_user?: {
        full_name: string;
        avatar_url?: string;
    };
    buyer_name?: string;
}

/**
 * Get or create a conversation for a listing
 */
export async function getOrCreateConversation(listingId: string, sellerId: string, buyerName: string = 'Eco Buyer'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if conversation exists
    const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .single();

    if (existing) return existing.id;

    // Create new conversation
    const { data, error } = await supabase
        .from('conversations')
        .insert({
            listing_id: listingId,
            buyer_id: user.id,
            seller_id: sellerId,
            buyer_name: buyerName, // Store buyer name
            last_message_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw error;
    return data.id;
}

/**
 * Fetch all conversations for the current user
 */
export async function getConversations(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('conversations')
        .select(`
            *,
            listing:listings(title, image_url, contact_name)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Fetch unread counts for all these conversations
    // We can do this efficiently by fetching all unread messages for the user
    // and grouping by conversation_id in memory.
    const { data: unreadMessages } = await supabase
        .from('messages')
        .select('conversation_id')
        .eq('is_read', false)
        .neq('sender_id', user.id);
    
    const unreadMap: Record<string, number> = {};
    if (unreadMessages) {
        unreadMessages.forEach((msg: { conversation_id: string }) => {
            unreadMap[msg.conversation_id] = (unreadMap[msg.conversation_id] || 0) + 1;
        });
    }

    return data.filter((conv: Conversation & { deleted_by_buyer: boolean; deleted_by_seller: boolean }) => {
        const isBuyer = conv.buyer_id === user.id;
        return isBuyer ? !conv.deleted_by_buyer : !conv.deleted_by_seller;
    }).map((conv: Conversation & { listing?: { contact_name?: string } }) => {
        const isBuyer = conv.buyer_id === user.id;
        // If I am buyer, other user is seller (use listing.contact_name)
        // If I am seller, other user is buyer (use conv.buyer_name)
        const otherName = isBuyer 
            ? (conv.listing?.contact_name || 'Seller') 
            : (conv.buyer_name || 'Interested Buyer');

        return {
            ...conv,
            unread_count: unreadMap[conv.id] || 0,
            other_user: {
                full_name: otherName,
                avatar_url: null // Can add avatar logic later
            }
        };
    });
}

/**
 * Delete a conversation (Hide for me)
 */
export async function deleteConversation(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Determine if I am buyer or seller to flip the correct flag
    const { data: conv } = await supabase.from('conversations').select('buyer_id, seller_id').eq('id', conversationId).single();
    if (!conv) return;

    const updates: { deleted_by_buyer?: boolean; deleted_by_seller?: boolean } = {};
    if (user.id === conv.buyer_id) updates.deleted_by_buyer = true;
    else if (user.id === conv.seller_id) updates.deleted_by_seller = true;

    if (Object.keys(updates).length > 0) {
        await supabase.from('conversations').update(updates).eq('id', conversationId);
        // Also mark messages as read so they don't ghost the unread count
        await markMessagesAsRead(conversationId);
    }
}

/**
 * Fetch messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

/**
 * Upload Image
 */
export async function uploadChatImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `chat-images/${fileName}`;

    // Use the existing 'listing-images' bucket which is already set up
    const { error: uploadError } = await supabase.storage
        .from('listing-images') 
        .upload(filePath, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage.from('listing-images').getPublicUrl(filePath);
    return data.publicUrl;
}

/**
 * Send a message (text or image)
 */
export async function sendMessage(conversationId: string, content: string, imageUrl?: string): Promise<ChatMessage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: content,
            image_url: imageUrl // Add image_url
        })
        .select()
        .single();

    if (error) throw error;

    // Update conversation timestamp AND unhide for both parties (in case they deleted it)
    await supabase
        .from('conversations')
        .update({ 
            last_message_at: new Date().toISOString(),
            deleted_by_buyer: false,
            deleted_by_seller: false
        })
        .eq('id', conversationId);

    return data;
}

/**
 * Subscribe to new messages
 */
export function subscribeToMessages(conversationId: string, callback: (msg: ChatMessage) => void) {
    return supabase
        .channel(`chat:${conversationId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`
            },
            (payload) => {
                callback(payload.new as ChatMessage);
            }
        )
        .subscribe();
}

/**
 * Get unread message count for the current user
 */
/**
 * Get unread message count for the current user, excluding deleted conversations
 */
export async function getUnreadCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Fetch unread messages with their conversation details to check for deletion
    const { data: unreadMessages, error } = await supabase
        .from('messages')
        .select(`
            id,
            conversation:conversations!inner(
                buyer_id,
                seller_id,
                deleted_by_buyer,
                deleted_by_seller
            )
        `)
        .eq('is_read', false)
        .neq('sender_id', user.id);

    if (error || !unreadMessages) return 0;

    // Filter out messages from conversations the user has deleted
    // Define a type for the joined message data
    type UnreadMessageWithConv = {
        conversation: {
            buyer_id: string;
            seller_id: string;
            deleted_by_buyer: boolean;
            deleted_by_seller: boolean;
        } | {
            buyer_id: string;
            seller_id: string;
            deleted_by_buyer: boolean;
            deleted_by_seller: boolean;
        }[];
    };

    const validUnreadMessages = unreadMessages.filter((msg: UnreadMessageWithConv) => {
        const convData = msg.conversation;
        const conv = Array.isArray(convData) ? convData[0] : convData;
        
        if (!conv) return false;

        const isBuyer = conv.buyer_id === user.id;
        const isSeller = conv.seller_id === user.id;

        if (isBuyer && conv.deleted_by_buyer) return false;
        if (isSeller && conv.deleted_by_seller) return false;

        return true;
    });

    return validUnreadMessages.length;
}

/**
 * Mark messages in a conversation as read
 */
export async function markMessagesAsRead(conversationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

    if (error) {
        console.error("Error marking messages as read:", error);
    } else {
         // Notify application to update unread counts
         if (typeof window !== 'undefined') {
             // Dispatch immediately
             window.dispatchEvent(new Event('messages-read'));
         }
    }
}

/**
 * Delete a specific message (Unsend)
 */
export async function deleteMessage(messageId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Verify ownership before delete (or rely on RLS)
    const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id); // Only allow deleting own messages

    if (error) throw error;
}
