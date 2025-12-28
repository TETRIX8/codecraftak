import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Image, 
  Mic, 
  StopCircle,
  Users, 
  ArrowLeft,
  Loader2,
  LogIn,
  Play,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  useMessages, 
  useSendMessage, 
  usePrivateChats, 
  useUploadMedia,
  Message 
} from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const GLOBAL_CHAT_ID = '00000000-0000-0000-0000-000000000001';

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chatId = searchParams.get('chat') || GLOBAL_CHAT_ID;
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const { user } = useAuth();
  const { data: messages, isLoading: messagesLoading } = useMessages(chatId);
  const { data: privateChats } = usePrivateChats();
  const sendMessage = useSendMessage();
  const uploadMedia = useUploadMedia();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    try {
      await sendMessage.mutateAsync({ chatId, content: message });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const url = await uploadMedia.mutateAsync({ file, type: 'image' });
      await sendMessage.mutateAsync({ chatId, messageType: 'image', fileUrl: url });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        try {
          const url = await uploadMedia.mutateAsync({ file: audioBlob, type: 'voice' });
          await sendMessage.mutateAsync({ chatId, messageType: 'voice', fileUrl: url });
        } catch (error) {
          console.error('Error uploading voice:', error);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const toggleAudio = (messageId: string, url: string) => {
    if (audioPlaying === messageId) {
      audioRefs.current[messageId]?.pause();
      setAudioPlaying(null);
    } else {
      // Pause any playing audio
      if (audioPlaying && audioRefs.current[audioPlaying]) {
        audioRefs.current[audioPlaying].pause();
      }

      if (!audioRefs.current[messageId]) {
        audioRefs.current[messageId] = new Audio(url);
        audioRefs.current[messageId].onended = () => setAudioPlaying(null);
      }

      audioRefs.current[messageId].play();
      setAudioPlaying(messageId);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Войдите в аккаунт</h1>
            <p className="text-muted-foreground mb-8">
              Чтобы писать сообщения, необходимо войти в аккаунт.
            </p>
            <Link to="/auth">
              <Button variant="gradient" size="lg">
                Войти
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 h-[calc(100vh-5rem)]">
        <div className="grid md:grid-cols-[300px_1fr] gap-4 h-full py-4">
          {/* Sidebar */}
          <div className="hidden md:flex flex-col rounded-xl bg-card border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Чаты
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {/* Global Chat */}
                <button
                  onClick={() => setSearchParams({})}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3",
                    chatId === GLOBAL_CHAT_ID 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">Общий чат</div>
                    <div className="text-xs text-muted-foreground">Все участники</div>
                  </div>
                </button>

                {/* Private Chats */}
                {privateChats?.map((chat) => {
                  const otherParticipant = chat.participants?.[0]?.profiles;
                  if (!otherParticipant) return null;

                  return (
                    <button
                      key={chat.id}
                      onClick={() => setSearchParams({ chat: chat.id })}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3",
                        chatId === chat.id 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-muted"
                      )}
                    >
                      <img
                        src={otherParticipant.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant.id}`}
                        alt={otherParticipant.nickname}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{otherParticipant.nickname}</div>
                        {chat.lastMessage && (
                          <div className="text-xs text-muted-foreground truncate">
                            {chat.lastMessage.message_type === 'text' 
                              ? chat.lastMessage.content 
                              : chat.lastMessage.message_type === 'image'
                              ? '📷 Фото'
                              : '🎤 Голосовое'}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex flex-col rounded-xl bg-card border border-border overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Link to="/users" className="md:hidden">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              {chatId === GLOBAL_CHAT_ID ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold">Общий чат</div>
                    <div className="text-xs text-muted-foreground">Все участники сообщества</div>
                  </div>
                </>
              ) : (
                (() => {
                  const chat = privateChats?.find(c => c.id === chatId);
                  const other = chat?.participants?.[0]?.profiles;
                  return other ? (
                    <>
                      <img
                        src={other.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other.id}`}
                        alt={other.nickname}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="font-semibold">{other.nickname}</div>
                    </>
                  ) : (
                    <div className="font-semibold">Загрузка...</div>
                  );
                })()
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !messages?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  Нет сообщений. Начните общение!
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <MessageBubble 
                      key={msg.id} 
                      message={msg} 
                      isOwn={msg.sender_id === user.id}
                      audioPlaying={audioPlaying}
                      onToggleAudio={toggleAudio}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMedia.isPending}
                >
                  <Image className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={isRecording ? 'text-destructive' : ''}
                >
                  {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Написать сообщение..."
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!message.trim() || sendMessage.isPending}
                  size="icon"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ 
  message, 
  isOwn,
  audioPlaying,
  onToggleAudio 
}: { 
  message: Message; 
  isOwn: boolean;
  audioPlaying: string | null;
  onToggleAudio: (id: string, url: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isOwn && "flex-row-reverse")}
    >
      {!isOwn && (
        <Link to={`/users/${message.sender_id}`}>
          <img
            src={message.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender_id}`}
            alt={message.sender?.nickname || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>
      )}
      <div className={cn("max-w-[70%]", isOwn && "items-end")}>
        {!isOwn && (
          <Link to={`/users/${message.sender_id}`}>
            <div className="text-xs font-medium text-muted-foreground mb-1 hover:text-primary">
              {message.sender?.nickname || 'Пользователь'}
            </div>
          </Link>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isOwn 
              ? "bg-primary text-primary-foreground rounded-br-md" 
              : "bg-muted rounded-bl-md"
          )}
        >
          {message.message_type === 'text' && (
            <p className="break-words">{message.content}</p>
          )}
          {message.message_type === 'image' && message.file_url && (
            <img 
              src={message.file_url} 
              alt="Изображение" 
              className="rounded-lg max-w-full max-h-64 object-cover"
            />
          )}
          {message.message_type === 'voice' && message.file_url && (
            <button 
              onClick={() => onToggleAudio(message.id, message.file_url!)}
              className="flex items-center gap-2"
            >
              {audioPlaying === message.id ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span className="text-sm">Голосовое сообщение</span>
            </button>
          )}
        </div>
        <div className={cn(
          "text-xs text-muted-foreground mt-1",
          isOwn && "text-right"
        )}>
          {format(new Date(message.created_at), 'HH:mm', { locale: ru })}
        </div>
      </div>
    </motion.div>
  );
}
