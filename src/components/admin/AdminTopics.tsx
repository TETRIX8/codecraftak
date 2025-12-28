import { useState } from 'react';
import { useAdminTopics } from '@/hooks/useTopics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MarkdownContent } from '@/components/common/MarkdownContent';
import { Plus, Edit, Trash2, Eye, EyeOff, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
  { value: 'general', label: 'Общее' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'algorithms', label: 'Алгоритмы' },
  { value: 'patterns', label: 'Паттерны' },
  { value: 'tips', label: 'Советы' },
];

interface TopicFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  is_published: boolean;
}

const emptyForm: TopicFormData = {
  title: '',
  description: '',
  content: '',
  category: 'general',
  is_published: true,
};

export function AdminTopics() {
  const { topics, isLoading, createTopic, updateTopic, deleteTopic } = useAdminTopics();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TopicFormData>(emptyForm);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) return;

    if (editingId) {
      await updateTopic.mutateAsync({ id: editingId, ...formData });
    } else {
      await createTopic.mutateAsync(formData);
    }

    setIsOpen(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleEdit = (topic: typeof topics[0]) => {
    setEditingId(topic.id);
    setFormData({
      title: topic.title,
      description: topic.description || '',
      content: topic.content,
      category: topic.category,
      is_published: topic.is_published,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить эту тему?')) {
      await deleteTopic.mutateAsync(id);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Управление темами
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingId(null);
            setFormData(emptyForm);
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить тему
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать тему' : 'Новая тема'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Заголовок</Label>
                  <Input
                    placeholder="Название темы"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Категория</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Краткое описание</Label>
                <Input
                  placeholder="Краткое описание темы"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">Редактор</TabsTrigger>
                  <TabsTrigger value="preview">Превью</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <div className="space-y-2">
                    <Label>Контент (Markdown)</Label>
                    <Textarea
                      placeholder="# Заголовок&#10;&#10;Текст с **жирным** и *курсивом*&#10;&#10;```javascript&#10;const code = 'example';&#10;```"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <ScrollArea className="h-[300px] border rounded-lg p-4 bg-background">
                    <MarkdownContent content={formData.content || '*Начните писать для предпросмотра...*'} />
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label>Опубликовано</Label>
                </div>
                <div className="flex-1" />
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.title || !formData.content}>
                  {editingId ? 'Сохранить' : 'Создать'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
        ) : topics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Нет созданных тем. Нажмите "Добавить тему" для создания первой.
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30 hover:border-border/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{topic.title}</h4>
                    {!topic.is_published && (
                      <span className="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">
                        Черновик
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="capitalize">{CATEGORIES.find(c => c.value === topic.category)?.label || topic.category}</span>
                    <span>•</span>
                    <span>{topic.views_count} просмотров</span>
                    <span>•</span>
                    <span>{new Date(topic.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateTopic.mutate({ id: topic.id, is_published: !topic.is_published })}
                  >
                    {topic.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(topic)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(topic.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
