import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Search, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const db = supabase as any;
type CaseStatus = 'new' | 'reviewing' | 'confirmed' | 'dismissed';

function normalizeCode(code: string) {
  return (code || '').toLowerCase().replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ' ').replace(/\b[a-z_$][\w$]*\b/g, 'ID').replace(/\d+(?:\.\d+)?/g, 'NUM').replace(/\s+/g, ' ').trim();
}

function grams(text: string, size = 5) {
  const values = new Set<string>();
  for (let i = 0; i <= text.length - size; i += 1) values.add(text.slice(i, i + size));
  return values;
}

function similarity(a: string, b: string) {
  const left = grams(a); const right = grams(b);
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  left.forEach((value) => { if (right.has(value)) intersection += 1; });
  return intersection / (left.size + right.size - intersection);
}

export function AdminAnticheat() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [scanPending, setScanPending] = useState(false);
  const [draftStatus, setDraftStatus] = useState<Record<string, CaseStatus>>({});
  const [draftComment, setDraftComment] = useState<Record<string, string>>({});

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['admin-anticheat-cases'],
    queryFn: async () => {
      const { data, error } = await db.from('anticheat_cases').select('*, profiles:subject_user_id(nickname), solutions:solution_id(task_id), compared:compared_solution_id(task_id)').order('risk_score', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, status, comment }: { id: string; status: CaseStatus; comment: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await db.from('anticheat_cases').update({ status, moderator_comment: comment || null, reviewed_at: status === 'new' ? null : new Date().toISOString(), reviewed_by: status === 'new' ? null : user?.id }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-anticheat-cases'] }); toast.success('Статус античит-случая сохранён'); },
    onError: (error: Error) => toast.error(error.message),
  });

  const runScan = async () => {
    setScanPending(true);
    try {
      const { data: solutions, error } = await db.from('solutions').select('id, task_id, user_id, code');
      if (error) throw error;
      const inserts: Record<string, unknown>[] = [];
      const groups = new Map<string, any[]>();
      (solutions || []).forEach((solution: any) => { if (!groups.has(solution.task_id)) groups.set(solution.task_id, []); groups.get(solution.task_id).push(solution); });
      groups.forEach((group) => {
        const normalized = group.map((solution) => ({ solution, code: normalizeCode(solution.code) }));
        for (let i = 0; i < normalized.length; i += 1) for (let j = i + 1; j < normalized.length; j += 1) {
          if (normalized[i].solution.user_id === normalized[j].solution.user_id) continue;
          const score = similarity(normalized[i].code, normalized[j].code);
          if (score >= 0.86) inserts.push({ solution_id: normalized[i].solution.id, compared_solution_id: normalized[j].solution.id, subject_user_id: normalized[i].solution.user_id, risk_score: Math.min(100, Math.round(score * 100)), reason: `Похожесть кода: ${Math.round(score * 100)}%` });
        }
      });
      if (inserts.length) {
        const { error: insertError } = await db.from('anticheat_cases').upsert(inserts, { onConflict: 'solution_id,compared_solution_id,reason', ignoreDuplicates: true });
        if (insertError) throw insertError;
      }
      queryClient.invalidateQueries({ queryKey: ['admin-anticheat-cases'] });
      toast.success(`Сканирование завершено: найдено ${inserts.length} подозрительных совпадений`);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Ошибка сканирования'); }
    finally { setScanPending(false); }
  };

  const filteredCases = useMemo(() => cases.filter((item: any) => `${item.profiles?.nickname || ''} ${item.reason}`.toLowerCase().includes(search.toLowerCase())), [cases, search]);
  const counts = { new: cases.filter((item: any) => item.status === 'new').length, reviewing: cases.filter((item: any) => item.status === 'reviewing').length, confirmed: cases.filter((item: any) => item.status === 'confirmed').length, dismissed: cases.filter((item: any) => item.status === 'dismissed').length };

  return <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{([['new', 'Новые', AlertTriangle], ['reviewing', 'На проверке', Search], ['confirmed', 'Подтверждены', CheckCircle2], ['dismissed', 'Отклонены', XCircle]] as const).map(([key, label, Icon]) => <Card key={key}><CardContent className="p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="h-4 w-4" />{label}</div><p className="mt-1 text-2xl font-bold">{counts[key]}</p></CardContent></Card>)}</div>
    <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" />Античит-проверка</CardTitle><Button onClick={runScan} disabled={scanPending}>{scanPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Запустить сканирование</Button></div></CardHeader><CardContent className="space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по пользователю или причине" className="pl-9" /></div>{isLoading ? <Loader2 className="mx-auto animate-spin" /> : filteredCases.length === 0 ? <p className="py-8 text-center text-muted-foreground">Случаев пока нет. Запусти сканирование.</p> : <div className="space-y-3">{filteredCases.map((item: any) => { const status = draftStatus[item.id] || item.status; return <div key={item.id} className="rounded-lg border border-border/60 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium">{item.profiles?.nickname || item.subject_user_id}</p><p className="text-sm text-muted-foreground">{item.reason}</p><p className="mt-1 text-xs text-muted-foreground">Решение: {item.solution_id} · Сравнение: {item.compared_solution_id || '—'}</p></div><span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">Риск {item.risk_score}%</span></div><div className="mt-3 grid gap-2 md:grid-cols-[180px_1fr_auto]"><Select value={status} onValueChange={(value) => setDraftStatus((prev) => ({ ...prev, [item.id]: value as CaseStatus }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="new">Новый</SelectItem><SelectItem value="reviewing">На проверке</SelectItem><SelectItem value="confirmed">Подтверждено</SelectItem><SelectItem value="dismissed">Отклонено</SelectItem></SelectContent></Select><Input value={draftComment[item.id] ?? item.moderator_comment ?? ''} onChange={(event) => setDraftComment((prev) => ({ ...prev, [item.id]: event.target.value }))} placeholder="Комментарий модератора" /><Button onClick={() => updateCase.mutate({ id: item.id, status, comment: draftComment[item.id] ?? item.moderator_comment ?? '' })} disabled={updateCase.isPending}>Сохранить</Button></div></div>; })}</div>}</CardContent></Card>
  </div>;
}
