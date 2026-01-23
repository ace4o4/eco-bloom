import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image as ImageIcon, Loader2, Trash2, Download, X, MoreVertical } from "lucide-react";
import { ChatMessage } from "@/lib/supabase-chat";

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (content: string, imageUrl?: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  isLoadingObj?: boolean;
}

interface PendingImage {
    id: string;
    url: string;
    file: File;
}

const ChatWindow = ({ messages, currentUserId, onSendMessage, onDeleteMessage, isLoadingObj }: ChatWindowProps) => {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingImages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(inputText);
      setInputText("");
    } catch (error) {
      console.error("Failed to send", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Create optimistic preview
      const previewUrl = URL.createObjectURL(file);
      const tempId = Math.random().toString();
      
      setPendingImages(prev => [...prev, { id: tempId, url: previewUrl, file }]);
      setIsSending(true);

      try {
           const { uploadChatImage } = await import('@/lib/supabase-chat');
           const url = await uploadChatImage(file);
           await onSendMessage("Sent an image", url);
           // Remove from pending once sent (real message will appear via optimistic update in parent)
           setPendingImages(prev => prev.filter(p => p.id !== tempId));
      } catch(err) {
         console.error(err);
         alert("Failed to upload image");
         setPendingImages(prev => prev.filter(p => p.id !== tempId));
      } finally {
         setIsSending(false);
         // Cleanup object URL
         URL.revokeObjectURL(previewUrl);
      }
  };

  return (
    <>
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/50 shadow-inner">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {messages.length === 0 && pendingImages.length === 0 ? (
           <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
             <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
                <span className="text-3xl">👋</span>
             </div>
             <p className="text-sm">Say hello! Discuss pickup times and details.</p>
           </div>
        ) : (
            <>
            {messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex group ${isMine ? "justify-end" : "justify-start"}`}
                >
                   {/* Delete Option (Only for mine) */}
                   {isMine && onDeleteMessage && (
                       <button
                           onClick={() => {
                               if(confirm("Delete this message?")) onDeleteMessage(msg.id);
                           }}
                           className="self-center mr-2 p-1.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                           title="Unsend Message"
                       >
                           <Trash2 className="w-3.5 h-3.5" />
                       </button>
                   )}

                   <div 
                     className={`
                       relative max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                       ${isMine 
                         ? "bg-primary text-primary-foreground font-medium rounded-tr-sm" 
                         : "bg-white dark:bg-zinc-800 border border-border/50 text-zinc-800 dark:text-zinc-100 rounded-tl-sm"
                       }
                     `}
                   >
                     {msg.image_url && (
                        <div className="mb-2 overflow-hidden rounded-lg border border-black/10 relative group/img">
                            <img 
                              src={msg.image_url} 
                              alt="Shared content" 
                              className="max-w-full h-auto object-cover max-h-64 cursor-zoom-in hover:opacity-95 transition-opacity bg-muted/50"
                              onClick={() => setLightboxImage(msg.image_url!)}
                              onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = '<div class="p-2 text-xs text-red-500 bg-red-50">Image failed to load</div>';
                              }}
                            />
                        </div>
                     )}
                     {msg.content}
                   </div>
                   <div className="text-[10px] text-muted-foreground mt-1 mx-1 self-end opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </motion.div>
              );
            })}
            
            {/* Pending Images (Loaders) */}
            {pendingImages.map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                     <div className="max-w-[75%] px-4 py-2.5 rounded-2xl bg-primary/80 text-primary-foreground rounded-tr-sm backdrop-blur-sm relative">
                        <div className="mb-2 overflow-hidden rounded-lg border border-white/20 relative">
                            <img src={img.url} alt="Sending..." className="max-w-full h-auto object-cover opacity-70" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                        </div>
                        <span className="text-xs opacity-90">Sending image...</span>
                     </div>
                </motion.div>
            ))}
            </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/50 border-t border-border/50">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
           <button 
             type="button"
             className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
             title="Add Image"
             onClick={() => document.getElementById('chat-image-input')?.click()}
           >
             <ImageIcon className="w-5 h-5" />
           </button>
           <input 
             type="file" 
             id="chat-image-input" 
             className="hidden" 
             accept="image/*"
             onChange={handleImageSelect} 
           />
           
           <input
             type="text"
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
             placeholder="Type a message..."
             className="flex-1 px-4 py-2.5 rounded-full bg-muted/30 border border-border/50 focus:border-primary focus:bg-background focus:outline-none transition-all"
           />

           <button
             type="submit"
             disabled={!inputText.trim() || isSending}
             className={`
               p-2.5 rounded-full bg-primary text-primary-foreground shadow-lg
               hover:shadow-primary/25 hover:scale-105 active:scale-95 transition-all
               disabled:opacity-50 disabled:cursor-not-allowed
             `}
           >
             {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
             ) : (
                <Send className="w-5 h-5 ml-0.5" />
             )}
           </button>
        </form>
      </div>
    </div>

    {/* Lightbox Modal */}
    <AnimatePresence>
        {lightboxImage && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 cursor-zoom-out"
                onClick={() => setLightboxImage(null)}
            >
                <motion.img
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    src={lightboxImage}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl pointer-events-auto"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                />
                <div className="absolute top-4 right-4 flex gap-3">
                    <a 
                        href={lightboxImage} 
                        download="eco-bloom-image" 
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download className="w-6 h-6" />
                    </a>
                    <button
                        onClick={() => setLightboxImage(null)}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
    </>
  );
};

export default ChatWindow;
