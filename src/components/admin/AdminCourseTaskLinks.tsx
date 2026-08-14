import { useMemo } from 'react';
import { Link2, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { sectionSlug, useCourseTaskLinksAdmin } from '@/hooks/useCourseSectionLinks';
import { javascript118Course, javascript118Stages } from '@/data/javascript118Course';
import { html56Course, html56Stages } from '@/data/html56Course';

const courses = [
  { slug: javascript118Course.slug, title: javascript118Course.title, stages: javascript118Stages },
  { slug: html56Course.slug, title: html56Course.title, stages: html56Stages },
] as const;

export function AdminCourseTaskLinks() {
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: links = [], isLoading: linksLoading, saveLink, removeLink } = useCourseTaskLinksAdmin();
  const linkMap = useMemo(() => new Map(links.map(link => [`${link.course_slug}:${link.section_id}`, link])), [links]);

  if (tasksLoading || linksLoading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3"><Link2 className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h2 className="font-semibold">Связь «курс → раздел → задание»</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Выберите существующее задание для каждого раздела. Проверка решения, очередь из трёх проверяющих, статусы и повторная отправка остаются общей системой сайта.</p></div></div>
        </CardContent>
      </Card>
      {courses.map(course => (
        <Card key={course.slug}>
          <CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle className="text-lg">{course.title}</CardTitle><Badge variant="outline">{course.stages.length} раздела</Badge></div></CardHeader>
          <CardContent className="space-y-3">
            {course.stages.map((stage, index) => {
              const sectionId = sectionSlug(stage.name);
              const link = linkMap.get(`${course.slug}:${sectionId}`);
              return <div key={sectionId} className="grid gap-3 rounded-xl border border-border/60 p-4 md:grid-cols-[minmax(0,1fr)_minmax(260px,1fr)_auto] md:items-center">
                <div><p className="font-medium">{index + 1}. {stage.name}</p><p className="text-xs text-muted-foreground">Занятия {stage.lessons} · {stage.hours} ч.</p></div>
                <Select value={link?.task_id || 'unlinked'} onValueChange={value => value === 'unlinked' ? (link && removeLink.mutate(link.id)) : saveLink.mutate({ courseSlug: course.slug, sectionId, sectionTitle: stage.name, sectionPosition: index + 1, taskId: value })}>
                  <SelectTrigger><SelectValue placeholder="Выберите задание" /></SelectTrigger>
                  <SelectContent><SelectItem value="unlinked">Без задания</SelectItem>{tasks.map(task => <SelectItem key={task.id} value={task.id}>{task.title} · {task.language}</SelectItem>)}</SelectContent>
                </Select>
                {link ? <Button variant="ghost" size="icon" aria-label="Удалить связь" onClick={() => removeLink.mutate(link.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button> : <span className="hidden h-9 w-9 md:block" />}
              </div>;
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
