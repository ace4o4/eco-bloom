import { motion } from "framer-motion";
import { User, MessageSquare, Trash2 } from "lucide-react";

interface Conversation {
  id: string;
  listing_id: string;
  other_user?: {
    full_name: string;
    avatar_url?: string;
  };
  listing?: {
    title: string;
    image_url?: string;
  };
  last_message_at: string;
  unread_count?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const ConversationList = ({ conversations, activeId, onSelect, onDelete, isLoading }: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-muted-foreground">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <MessageSquare className="w-6 h-6 opacity-50" />
        </div>
        <p>No conversations yet</p>
        <p className="text-sm">Start chatting by contacting a seller!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-3 space-y-2">
      {conversations.map((conv) => (
        <div key={conv.id} className="relative group">
            <motion.button
            onClick={() => onSelect(conv.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left pr-10
                ${activeId === conv.id 
                ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary shadow-sm" 
                : "hover:bg-muted/50 border-l-4 border-transparent"
                }
            `}
            >
            {/* Avatar Area */}
            <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden border border-border/50">
                {conv.other_user?.avatar_url ? (
                    <img src={conv.other_user.avatar_url} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <User className="w-5 h-5 text-primary" />
                )}
                </div>
                {/* Online Status (Mocked) */}
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
            </div>

            {/* Info Area */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                <h3 className={`font-semibold text-sm truncate pr-2 ${conv.unread_count && conv.unread_count > 0 ? 'text-foreground' : 'text-foreground/90'}`}>
                    {conv.other_user?.full_name || "Eco User"}
                </h3>
                <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate flex items-center gap-1 ${conv.unread_count && conv.unread_count > 0 ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                        <span>{conv.listing?.title || "Listing"}</span>
                    </p>
                    {conv.unread_count && conv.unread_count > 0 && (
                        <div className="min-w-[8px] h-[8px] rounded-full bg-red-500" />
                    )}
                </div>
            </div>
            </motion.button>
            <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    if(confirm("Delete this conversation for me?")) onDelete(conv.id);
                }}
                title="Delete for me"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
