import { useState, useEffect } from 'react';
import { useSiteContent, useUpdateSiteContent, SiteContent } from '@/hooks/useSiteContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Edit3, Save, Loader2, Type, Layout, Navigation, BookOpen, Eye, Undo2, Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PAGE_ICONS: Record<string, any> = {
  home: Layout,
  tasks: BookOpen,
  topics: BookOpen,
  nav: Navigation,
};

const PAGE_LABELS: Record<string, string> = {
  home: 'Главная страница',
  tasks: 'Страница заданий',
  topics: 'Страница тем',
  nav: 'Навигация',
};

export function ModeratorCMS() {
  const { data: contents, isLoading } = useSiteContent();
  const updateContent = useUpdateSiteContent();
  const [editedValues, setEditedValues] = useState<Record<string, { value: string; fontSize?: string; color?: string; fontWeight?: string }>>({});
  const [activeTab, setActiveTab] = useState('home');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (contents) {
      const map: Record<string, { value: string; fontSize?: string; color?: string; fontWeight?: string }> = {};
      contents.forEach(c => {
        const styles = (c.styles || {}) as Record<string, string>;
        map[c.content_key] = {
          value: c.content_value,
          fontSize: styles.fontSize || '',
          color: styles.color || '',
          fontWeight: styles.fontWeight || '',
        };
      });
      setEditedValues(map);
    }
  }, [contents]);

  const pages = contents ? [...new Set(contents.map(c => c.page))] : [];

  const hasChanges = contents?.some(c => {
    const edited = editedValues[c.content_key];
    if (!edited) return false;
    const styles = (c.styles || {}) as Record<string, string>;
    return edited.value !== c.content_value ||
      (edited.fontSize || '') !== (styles.fontSize || '') ||
      (edited.color || '') !== (styles.color || '') ||
      (edited.fontWeight || '') !== (styles.fontWeight || '');
  });

  const handleSave = async () => {
    if (!contents) return;
    const updates = contents
      .filter(c => {
        const edited = editedValues[c.content_key];
        if (!edited) return false;
        const styles = (c.styles || {}) as Record<string, string>;
        return edited.value !== c.content_value ||
          (edited.fontSize || '') !== (styles.fontSize || '') ||
          (edited.color || '') !== (styles.color || '') ||
          (edited.fontWeight || '') !== (styles.fontWeight || '');
      })
      .map(c => ({
        content_key: c.content_key,
        content_value: editedValues[c.content_key].value,
        styles: {
          fontSize: editedValues[c.content_key].fontSize || '',
          color: editedValues[c.content_key].color || '',
          fontWeight: editedValues[c.content_key].fontWeight || '',
        },
      }));

    if (updates.length === 0) {
      toast.info('Нет изменений для сохранения');
      return;
    }

    try {
      await updateContent.mutateAsync(updates);
      toast.success(`Сохранено ${updates.length} изменений`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleReset = () => {
    if (contents) {
      const map: Record<string, { value: string; fontSize?: string; color?: string; fontWeight?: string }> = {};
      contents.forEach(c => {
        const styles = (c.styles || {}) as Record<string, string>;
        map[c.content_key] = {
          value: c.content_value,
          fontSize: styles.fontSize || '',
          color: styles.color || '',
          fontWeight: styles.fontWeight || '',
        };
      });
      setEditedValues(map);
      toast.info('Изменения отменены');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="border-cyan-500/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-cyan-400" />
          Редактор контента сайта
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-1" />
            {previewMode ? 'Редактор' : 'Превью'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Отмена
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || updateContent.isPending}
            className="bg-gradient-to-r from-cyan-500 to-violet-500 text-white"
          >
            {updateContent.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Сохранить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Есть несохранённые изменения
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${pages.length}, 1fr)` }}>
            {pages.map(page => {
              const Icon = PAGE_ICONS[page] || Type;
              return (
                <TabsTrigger key={page} value={page} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{PAGE_LABELS[page] || page}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {pages.map(page => (
            <TabsContent key={page} value={page} className="space-y-4 mt-4">
              {contents?.filter(c => c.page === page).map((item) => {
                const edited = editedValues[item.content_key] || { value: item.content_value };
                return (
                  <motion.div
                    key={item.content_key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl border border-border bg-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="font-medium text-foreground">{item.label}</Label>
                      <Badge variant="outline" className="text-xs">{item.content_key}</Badge>
                    </div>

                    {previewMode ? (
                      <div
                        className="p-3 rounded-lg bg-secondary/30 border border-border min-h-[40px]"
                        style={{
                          fontSize: edited.fontSize || undefined,
                          color: edited.color || undefined,
                          fontWeight: edited.fontWeight || undefined,
                        }}
                      >
                        {edited.value}
                      </div>
                    ) : (
                      <>
                        {item.content_value.length > 80 ? (
                          <Textarea
                            value={edited.value}
                            onChange={e => setEditedValues(prev => ({
                              ...prev,
                              [item.content_key]: { ...prev[item.content_key], value: e.target.value }
                            }))}
                            rows={3}
                          />
                        ) : (
                          <Input
                            value={edited.value}
                            onChange={e => setEditedValues(prev => ({
                              ...prev,
                              [item.content_key]: { ...prev[item.content_key], value: e.target.value }
                            }))}
                          />
                        )}

                        {/* Style controls */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-muted-foreground" />
                            <Label className="text-xs text-muted-foreground">Размер:</Label>
                            <Select
                              value={edited.fontSize || 'default'}
                              onValueChange={v => setEditedValues(prev => ({
                                ...prev,
                                [item.content_key]: { ...prev[item.content_key], fontSize: v === 'default' ? '' : v }
                              }))}
                            >
                              <SelectTrigger className="w-[100px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">По умолч.</SelectItem>
                                <SelectItem value="14px">14px</SelectItem>
                                <SelectItem value="16px">16px</SelectItem>
                                <SelectItem value="18px">18px</SelectItem>
                                <SelectItem value="24px">24px</SelectItem>
                                <SelectItem value="32px">32px</SelectItem>
                                <SelectItem value="48px">48px</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Жирность:</Label>
                            <Select
                              value={edited.fontWeight || 'default'}
                              onValueChange={v => setEditedValues(prev => ({
                                ...prev,
                                [item.content_key]: { ...prev[item.content_key], fontWeight: v === 'default' ? '' : v }
                              }))}
                            >
                              <SelectTrigger className="w-[100px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">По умолч.</SelectItem>
                                <SelectItem value="normal">Обычный</SelectItem>
                                <SelectItem value="500">Средний</SelectItem>
                                <SelectItem value="bold">Жирный</SelectItem>
                                <SelectItem value="900">Чёрный</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Цвет:</Label>
                            <input
                              type="color"
                              value={edited.color || '#ffffff'}
                              onChange={e => setEditedValues(prev => ({
                                ...prev,
                                [item.content_key]: { ...prev[item.content_key], color: e.target.value }
                              }))}
                              className="w-8 h-8 rounded border border-border cursor-pointer"
                            />
                            {edited.color && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs px-2"
                                onClick={() => setEditedValues(prev => ({
                                  ...prev,
                                  [item.content_key]: { ...prev[item.content_key], color: '' }
                                }))}
                              >
                                Сбросить
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
