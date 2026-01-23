import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { getConversations, getMessages, sendMessage, subscribeToMessages, markMessagesAsRead, Conversation, ChatMessage } from "@/lib/supabase-chat";
import { supabase } from "@/lib/supabase";
import ConversationList from "@/components/chat/ConversationList";
import ChatWindow from "@/components/chat/ChatWindow";

const Messages = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoadingConvs, setIsLoadingConvs] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string>("");

    // Load User & Conversations
    useEffect(() => {
        const loadInitialData = async () => {
             const { data: { user } } = await supabase.auth.getUser();
             if (user) {
                 setCurrentUserId(user.id);
                 try {
                     const convs = await getConversations();
                     setConversations(convs);
                     if (convs.length > 0 && !activeId) {
                         // Optional: Auto-select first conversation
                         // setActiveId(convs[0].id);
                     }
                 } catch (err) {
                     console.error("Failed to load conversations", err);
                 } finally {
                     setIsLoadingConvs(false);
                 }
             }
        };
        loadInitialData();
    }, []);

    // Instant handler for clicking a conversation
    const handleSelectConversation = (id: string) => {
        setActiveId(id);
        
        // Optimistic: Remove red dot INSTANTLY from list
        setConversations(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, unread_count: 0 } : c);
            
            // Check if ANY unread remain
            const hasRemainingUnread = updated.some(c => (c.unread_count || 0) > 0);
            if (!hasRemainingUnread) {
                // If no unread left, clear Navbar dot immediately
                window.dispatchEvent(new Event('clear-navbar-unread'));
            }
            
            return updated;
        });
    };

    // Fetch Messages when Active Chat Changes
    useEffect(() => {
        if (!activeId) return;

        let subscription: any;

        const loadMessages = async () => {
             try {
                 // 2. Load dependencies (markMessagesAsRead is now imported at top, but we keep logic flow)

                 // 3. Parallelize fetching content and marking as read in DB
                 // 3. Fetch content first so user sees messages immediately
                 const msgs = await getMessages(activeId);
                 setMessages(msgs);

                 // 4. Then mark as read in background (DB update)
                 // This will trigger 'messages-read' event from the lib
                 await markMessagesAsRead(activeId); 
                 
                 // Realtime Subscription
                 subscription = subscribeToMessages(activeId, (newMsg) => {
                     setMessages(prev => {
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                     });
                     // Also update convo list last_message_at
                     setConversations(prev => prev.map(c => 
                        c.id === activeId ? { ...c, last_message_at: newMsg.created_at } : c
                     ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()));

                     // Important: If we receive a message while looking at the chat, mark it as read immediately
                     if (newMsg.sender_id !== currentUserId) {
                         markMessagesAsRead(activeId).catch(console.error);
                     }
                 });

             } catch (err) {
                 console.error("Failed to load messages", err);
             }
        };

        loadMessages();

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [activeId]);

    const handleSendMessage = async (content: string, imageUrl?: string) => {
        if (!activeId) return;
        try {
            const sentMsg = await sendMessage(activeId, content, imageUrl);
            // Optimistic update (check for duplicates first)
            setMessages(prev => {
                if (prev.some(m => m.id === sentMsg.id)) return prev;
                return [...prev, sentMsg];
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const handleDeleteConversation = async (id: string) => {
        try {
            // Dynamic import to avoid circular dependency issues if any
            const { deleteConversation } = await import('@/lib/supabase-chat');
            await deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));
            if (activeId === id) setActiveId(null);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            
            <main className="flex-1 container max-w-7xl mx-auto px-4 py-8 pt-24 h-[calc(100vh-80px)]">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
                    
                    {/* Sidebar (Conversations) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`
                             md:col-span-4 lg:col-span-3 bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-lg flex flex-col overflow-hidden
                             ${activeId ? 'hidden md:flex' : 'flex'}
                        `}
                    >
                        <div className="p-4 border-b border-border/50 bg-muted/20">
                            <h2 className="font-bold text-lg">Messages</h2>
                        </div>
                        <ConversationList 
                            conversations={conversations}
                            activeId={activeId}
                            isLoading={isLoadingConvs}
                            onSelect={handleSelectConversation}
                            onDelete={handleDeleteConversation}
                        />
                    </motion.div>

                    {/* Chat Area */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`
                            md:col-span-8 lg:col-span-9 h-full flex flex-col
                             ${!activeId ? 'hidden md:flex' : 'flex'}
                        `}
                    >
                         {activeId ? (
                             <>
                               {/* Mobile Back Button */}
                               <div className="md:hidden mb-2">
                                  <button onClick={() => setActiveId(null)} className="text-sm text-muted-foreground hover:text-primary">
                                    ← Back to list
                                  </button>
                               </div>
                               <ChatWindow 
                                   messages={messages}
                                   currentUserId={currentUserId}
                                   onSendMessage={handleSendMessage}
                               />
                             </>
                         ) : (
                             <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-card/30 rounded-[2rem] border border-border/50 border-dashed">
                                 <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center animate-pulse-slow">
                                     <span className="text-4xl">💬</span>
                                 </div>
                                 <h3 className="text-2xl font-bold mb-2">Your Messages</h3>
                                 <p className="text-muted-foreground max-w-sm">
                                     Select a conversation from the sidebar to continue chatting with sellers or buyers.
                                 </p>
                             </div>
                         )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Messages;
