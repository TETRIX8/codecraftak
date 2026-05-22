import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type Section = {
  title: string;
  questions: string[];
};

const sections: Section[] = [
  {
    title: 'JavaScript — Массивы',
    questions: [
      'Что такое массивы в JavaScript? Как их создавать?',
      'Как получить доступ к элементам массива?',
      'Какие методы используются для добавления элементов в конец массива? (push)',
      'Какие методы используются для удаления элементов из конца массива? (pop)',
      'Какие методы используются для добавления элементов в начало массива? (unshift)',
      'Какие методы используются для удаления элементов из начала массива? (shift)',
      'Объясните деструктуризацию массивов.',
    ],
  },
  {
    title: 'JavaScript — DOM & События',
    questions: [
      'Что такое DOM? Объясните его структуру.',
      'Как получить доступ к элементам DOM по ID?',
      'Как получить доступ к элементам DOM по классу?',
      'Как получить доступ к элементам DOM по тегу?',
      'Как изменить текстовое содержимое элемента? (textContent)',
      'Как изменить стили элемента через JavaScript?',
      'Что такое события в JavaScript? Приведите примеры (например, клик).',
      'Как добавить обработчик события к элементу? (addEventListener)',
      'Что такое alert(), confirm() и prompt()?',
      'Что такое объект navigator и для чего он используется?',
    ],
  },
  {
    title: 'JavaScript — Асинхронность',
    questions: [
      'Что такое асинхронность в JavaScript?',
      'Объясните работу setTimeout().',
      'Объясните работу setInterval().',
      'Как остановить setInterval()? (clearInterval)',
      'Что такое промисы (Promises)? Объясните их состояния (pending, fulfilled, rejected).',
      'Как использовать then() и catch() с промисами?',
    ],
  },
  {
    title: 'SQL & Базы данных',
    questions: [
      'Что такое SQL? Для чего он используется?',
      'Объясните основные типы данных в SQL (например, INT, VARCHAR, DATE).',
      'Как выбрать все данные из таблицы? (SELECT * FROM table_name)',
      'Как выбрать определённые столбцы?',
      'Что такое WHERE clause? Приведите примеры условий.',
      'Как использовать операторы сравнения (=, !=, >, <, >=, <=) в SQL?',
      'Что такое AND, OR в SQL?',
      'Что такое DISTINCT и для чего он используется?',
    ],
  },
];

export default function Exams() {
  const total = sections.reduce((s, sec) => s + sec.questions.length, 0);

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          'radial-gradient(ellipse at top, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(ellipse at bottom, hsl(var(--accent) / 0.15), transparent 60%), hsl(var(--background))',
      }}
    >
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <GraduationCap className="w-4 h-4 text-[hsl(var(--primary))]" />
            <span className="text-sm tracking-wider uppercase text-muted-foreground">
              Допуск к экзаменам
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
            Готовься к экзамену
          </h1>
          <p className="text-lg text-muted-foreground italic">
            {sections.length} тем · {total} вопросов — пройди их перед сдачей.
          </p>
        </motion.div>

        <div className="space-y-4">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="rounded-2xl glass-panel overflow-hidden"
            >
              <Accordion type="single" collapsible defaultValue={idx === 0 ? section.title : undefined}>
                <AccordionItem value={section.title} className="border-0">
                  <AccordionTrigger className="px-6 py-5 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-bold">{section.title}</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {section.questions.length} вопросов
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <ol className="space-y-3">
                      {section.questions.map((q, i) => (
                        <li
                          key={i}
                          className="flex gap-3 p-3 rounded-lg bg-[hsl(var(--background))]/40 border border-[hsl(var(--border))]/60 hover:border-[hsl(var(--primary))]/40 transition-colors"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-md bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))] font-mono text-sm font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-sm md:text-base leading-relaxed pt-0.5">{q}</span>
                        </li>
                      ))}
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
