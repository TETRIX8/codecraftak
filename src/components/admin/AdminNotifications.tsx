import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Bell, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminNotifications } from '@/hooks/usePushNotifications';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

const notificationTypes: { value: NotificationType; label: string; icon: string }[] = [
  { value: 'info', label: 'Информация', icon: 'ℹ️' },
  { value: 'success', label: 'Успех', icon: '✅' },
  { value: 'warning', label: 'Предупреждение', icon: '⚠️' },
  { value: 'error', label: 'Важно', icon: '🚨' },
];

export function AdminNotifications() {
  const { sendToAll, isSending } = useAdminNotifications();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      return;
    }

    sendToAll({ title, message, type });
    setTitle('');
    setMessage('');
    setType('info');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Рассылка уведомлений</CardTitle>
              <CardDescription>Отправить уведомление всем пользователям</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Тип уведомления</label>
            <Select value={type} onValueChange={(v: NotificationType) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Заголовок</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Заголовок уведомления"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Сообщение</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Текст уведомления..."
              rows={3}
            />
          </div>

          <Button
            variant="gradient"
            className="w-full"
            onClick={handleSend}
            disabled={isSending || !title.trim() || !message.trim()}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            <Users className="w-4 h-4 mr-2" />
            Отправить всем
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
