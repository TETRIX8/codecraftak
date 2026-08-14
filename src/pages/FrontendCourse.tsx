import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Check, ChevronRight, Clock3, Code2, Layers3, Lightbulb, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MarkdownContent } from '@/components/common/MarkdownContent';
import { type CourseStage } from '@/data/courseTypes';
import { javascript118Course, javascript118Stages } from '@/data/javascript118Course';
import { html56Course, html56Stages } from '@/data/html56Course';

const STORAGE_KEY = 'frontend-course-progress-v1';

const stageClasses: Record<CourseStage, string> = {
  HTML: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  CSS: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  JavaScript: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
};

function readProgress(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function FrontendCourse() {
  const navigate = useNavigate();
  const { slug, lessonId } = useParams<{ slug?: string; lessonId?: string }>();
  const [completed, setCompleted] = useState<string[]>(readProgress);
  const isJavascript118 = slug === javascript118Course.slug;
  const activeCourse = isJavascript118 ? javascript118Course : html56Course;
  const activeStages = isJavascript118 ? javascript118Stages : html56Stages;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  const selectedLesson = useMemo(
    () => activeCourse.lessons.find(item => item.id === lessonId),
    [activeCourse, lessonId],
  );
  const progress = Math.round((completed.length / activeCourse.lessons.length) * 100);

  const toggleCompleted = (id: string) => {
    setCompleted(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  };

  const openLesson = (id: string) => navigate(`/courses/${activeCourse.slug}/${id}`);

  if (selectedLesson) {
    const lessonIndex = activeCourse.lessons.findIndex(item => item.id === selectedLesson.id);
    const nextLesson = activeCourse.lessons[lessonIndex + 1];
    return (
      <div className="min-h-screen w-full min-w-0 overflow-x-clip pb-16">
        <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/15 via-background to-accent/10">
          <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-10">
            <Button variant="ghost" onClick={() => navigate(`/courses/${activeCourse.slug}`)} className="mb-6 -ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" /> К курсу
            </Button>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={stageClasses[selectedLesson.stage]} variant="outline">{selectedLesson.stage}</Badge>
              <Badge variant="outline"><Clock3 className="mr-1 h-3 w-3" /> {selectedLesson.duration}</Badge>
              <span className="text-sm text-muted-foreground">Занятие {selectedLesson.number} из {activeCourse.lessons.length}</span>
            </div>
            <h1 className="max-w-3xl break-words text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{selectedLesson.title}</h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{selectedLesson.goal}</p>
          </div>
        </div>

        <main className="container mx-auto grid w-full min-w-0 max-w-5xl gap-6 overflow-x-clip px-3 py-6 sm:px-4 sm:py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-4 shadow-xl shadow-primary/5 sm:p-8">
            <div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-primary" />
                <div><p className="font-semibold">Простая аналогия</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedLesson.analogy}</p></div>
              </div>
            </div>
            <MarkdownContent content={selectedLesson.content} />
            <div className="mt-8 rounded-xl border border-border/50 bg-muted/20 p-5">
              <div className="flex items-start gap-3"><Play className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><p className="font-semibold">Практика занятия</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedLesson.practice}</p></div></div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button onClick={() => toggleCompleted(selectedLesson.id)} variant={completed.includes(selectedLesson.id) ? 'secondary' : 'default'} className="gap-2">
                <Check className="h-4 w-4" /> {completed.includes(selectedLesson.id) ? 'Занятие пройдено' : 'Отметить как пройденное'}
              </Button>
              {nextLesson ? <Button variant="outline" onClick={() => openLesson(nextLesson.id)}>Следующее занятие <ChevronRight className="ml-2 h-4 w-4" /></Button> : <Button variant="outline" onClick={() => navigate(`/courses/${activeCourse.slug}`)}>Завершить курс</Button>}
            </div>
          </article>
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <Card className="border-border/50 bg-card/70">
              <CardHeader><CardTitle className="text-base">Прогресс курса</CardTitle></CardHeader>
              <CardContent><div className="flex items-end justify-between"><span className="text-3xl font-bold">{progress}%</span><span className="text-sm text-muted-foreground">{completed.length}/{activeCourse.lessons.length}</span></div><Progress value={progress} className="mt-3" /><div className="mt-5 space-y-2">{activeCourse.lessons.map(item => <button key={item.id} onClick={() => openLesson(item.id)} className={`flex w-full items-center gap-2 rounded-lg p-2 text-left text-xs transition-colors hover:bg-muted ${item.id === selectedLesson.id ? 'bg-primary/10 text-primary' : ''}`}><span className="w-5 text-muted-foreground">{item.number}</span><span className="min-w-0 flex-1 truncate">{item.title}</span>{completed.includes(item.id) && <Check className="h-3.5 w-3.5 text-green-400" />}</button>)}</div></CardContent>
            </Card>
          </aside>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-clip pb-16">
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/20 via-background to-purple-500/10">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="container relative mx-auto max-w-6xl px-4 py-10 sm:py-16">
          <Button variant="ghost" onClick={() => navigate('/topics')} className="mb-8 -ml-2"><ArrowLeft className="mr-2 h-4 w-4" /> Все темы</Button>
          <div className="grid min-w-0 items-end gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0"><div className="mb-5 flex flex-wrap gap-2"><Badge className="gap-1"><Sparkles className="h-3 w-3" /> Авторский маршрут</Badge><Badge variant="outline">{activeCourse.totalHours} часов</Badge><Badge variant="outline">{activeCourse.lessons.length} занятий</Badge></div><h1 className="max-w-3xl break-words text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">{activeCourse.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{activeCourse.description}</p><Button size="lg" className="mt-7 gap-2" onClick={() => openLesson(activeCourse.lessons[Math.min(completed.length, activeCourse.lessons.length - 1)].id)}><Play className="h-4 w-4" /> Продолжить обучение</Button></div>
            <Card className="border-primary/20 bg-background/50 backdrop-blur"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Ваш прогресс</p><p className="mt-1 text-4xl font-bold">{progress}%</p></div><div className="rounded-2xl bg-primary/10 p-4 text-primary"><Code2 className="h-8 w-8" /></div></div><Progress value={progress} className="mt-5" /><p className="mt-3 text-sm text-muted-foreground">{completed.length} из {activeCourse.lessons.length} занятий отмечено</p></CardContent></Card>
          </div>
        </div>
      </section>
      <main className="container mx-auto w-full min-w-0 max-w-6xl overflow-x-clip px-3 py-8 sm:px-4 sm:py-10">
        <div className="grid gap-4 md:grid-cols-3">{activeStages.map(stage => <Card key={stage.name} className="border-border/50 bg-card/60"><CardContent className="p-5"><div className="flex items-center justify-between"><span className="font-semibold">{stage.name}</span><Badge variant="outline">{stage.hours} ч.</Badge></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{stage.description}</p><p className="mt-4 text-xs text-muted-foreground">Занятия {stage.lessons}</p></CardContent></Card>)}</div>
        <div className="mb-6 mt-12 flex items-end justify-between"><div><p className="text-sm font-medium uppercase tracking-widest text-primary">Учебная карта</p><h2 className="mt-2 text-3xl font-bold">Все занятия по порядку</h2></div><Layers3 className="hidden h-8 w-8 text-muted-foreground sm:block" /></div>
        <div className="grid gap-4 md:grid-cols-2">{activeCourse.lessons.map(item => <motion.button key={item.id} whileHover={{ y: -3 }} onClick={() => openLesson(item.id)} className="text-left"><Card className="h-full border-border/50 bg-card/60 transition-colors hover:border-primary/40"><CardContent className="flex gap-4 p-5"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${stageClasses[item.stage]}`}>{String(item.number).padStart(2, '0')}</div><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="outline" className={stageClasses[item.stage]}>{item.stage}</Badge><span className="text-xs text-muted-foreground">{item.duration}</span>{completed.includes(item.id) && <Check className="ml-auto h-4 w-4 text-green-400" />}</div><h3 className="font-semibold leading-6">{item.title}</h3><p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.goal}</p></div><ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" /></CardContent></Card></motion.button>)}</div>
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8"><div className="flex items-start gap-4"><BookOpen className="mt-1 h-6 w-6 shrink-0 text-primary" /><div><h2 className="text-xl font-bold">Как проходить курс</h2><p className="mt-2 max-w-3xl leading-7 text-muted-foreground">На каждое занятие закладывайте примерно два часа: 35 минут на объяснение, 25 минут на разбор примеров, 50 минут на практику и 10 минут на повторение. Не переходите дальше, пока не сможете объяснить тему своими словами и изменить пример самостоятельно.</p></div></div></div>
      </main>
    </div>
  );
}
