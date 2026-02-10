import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, BookOpen, Users, Plus, Trash2, Edit2, Loader2, ArrowLeft, Check, X, Clock as ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useIsStarosta } from '@/hooks/useRoles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const dayNames: Record<number, string> = { 1: 'Понедельник', 2: 'Вторник', 3: 'Среда', 4: 'Четверг', 5: 'Пятница', 6: 'Суббота', 7: 'Воскресенье' };
const statusLabels: Record<string, string> = { present: 'Присутствует', absent: 'Отсутствует', late: 'Опоздал', excused: 'Уважительная' };
const statusColors: Record<string, string> = { present: 'bg-success/20 text-success', absent: 'bg-destructive/20 text-destructive', late: 'bg-warning/20 text-warning', excused: 'bg-primary/20 text-primary' };

export default function StarostaPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isStarosta, isLoading: roleLoading } = useIsStarosta();
  const queryClient = useQueryClient();
  const [subjectDialog, setSubjectDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectTeacher, setSubjectTeacher] = useState('');
  const [schedDay, setSchedDay] = useState('1');
  const [schedSubject, setSchedSubject] = useState('');
  const [schedStart, setSchedStart] = useState('09:00');
  const [schedEnd, setSchedEnd] = useState('10:30');
  const [schedRoom, setSchedRoom] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('subjects').select('*').order('name');
      if (error) throw error;
      return data;
    },
    enabled: isStarosta,
  });

  const { data: schedule } = useQuery({
    queryKey: ['schedule'],
    queryFn: async () => {
      const { data, error } = await supabase.from('schedule').select('*, subjects(name, teacher)').order('day_of_week').order('start_time');
      if (error) throw error;
      return data;
    },
    enabled: isStarosta,
  });

  const { data: students } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, nickname, avatar_url').eq('is_deleted', false).order('nickname');
      if (error) throw error;
      return data;
    },
    enabled: isStarosta,
  });

  const { data: attendance } = useQuery({
    queryKey: ['attendance', selectedScheduleId, attendanceDate],
    queryFn: async () => {
      if (!selectedScheduleId) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles!attendance_student_id_fkey(nickname)')
        .eq('schedule_id', selectedScheduleId)
        .eq('date', attendanceDate);
      if (error) throw error;
      return data;
    },
    enabled: isStarosta && !!selectedScheduleId,
  });

  const addSubject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('subjects').insert({ name: subjectName, teacher: subjectTeacher || null, created_by: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Предмет добавлен');
      setSubjectDialog(false);
      setSubjectName('');
      setSubjectTeacher('');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Предмет удалён');
    },
  });

  const addScheduleEntry = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('schedule').insert({
        subject_id: schedSubject,
        day_of_week: parseInt(schedDay),
        start_time: schedStart,
        end_time: schedEnd,
        room: schedRoom || null,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Занятие добавлено');
      setScheduleDialog(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteScheduleEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schedule').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      toast.success('Занятие удалено');
    },
  });

  const markAttendance = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: string }) => {
      const { error } = await supabase.from('attendance').upsert({
        schedule_id: selectedScheduleId,
        student_id: studentId,
        date: attendanceDate,
        status,
        marked_by: user!.id,
      }, { onConflict: 'schedule_id,student_id,date' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (roleLoading) {
    return <div className="min-h-screen bg-background py-24 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isStarosta) {
    return (
      <div className="min-h-screen bg-background py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Доступ запрещён</h1>
        <Button variant="outline" onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4 mr-2" />На главную</Button>
      </div>
    );
  }

  const attendanceMap = new Map(attendance?.map(a => [a.student_id, a]) ?? []);

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-accent" />
          <div>
            <h1 className="text-3xl font-bold">Панель Старосты</h1>
            <p className="text-muted-foreground">Расписание, предметы и посещаемость</p>
          </div>
        </div>

        <Tabs defaultValue="schedule">
          <TabsList>
            <TabsTrigger value="subjects">Предметы</TabsTrigger>
            <TabsTrigger value="schedule">Расписание</TabsTrigger>
            <TabsTrigger value="attendance">Посещаемость</TabsTrigger>
          </TabsList>

          {/* Subjects */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Предметы</CardTitle>
                <Button variant="gradient" size="sm" onClick={() => setSubjectDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />Добавить
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subjects?.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                      <div>
                        <span className="font-medium">{s.name}</span>
                        {s.teacher && <p className="text-sm text-muted-foreground">Преподаватель: {s.teacher}</p>}
                      </div>
                      <Button variant="outline" size="icon" onClick={() => { if (confirm('Удалить предмет?')) deleteSubject.mutate(s.id); }}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {subjects?.length === 0 && <p className="text-center text-muted-foreground py-4">Предметов нет</p>}
                </div>
              </CardContent>
            </Card>

            <Dialog open={subjectDialog} onOpenChange={setSubjectDialog}>
              <DialogContent>
                <DialogHeader><DialogTitle>Добавить предмет</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Название предмета" value={subjectName} onChange={e => setSubjectName(e.target.value)} />
                  <Input placeholder="Преподаватель (необязательно)" value={subjectTeacher} onChange={e => setSubjectTeacher(e.target.value)} />
                  <Button variant="gradient" className="w-full" onClick={() => addSubject.mutate()} disabled={!subjectName.trim() || addSubject.isPending}>
                    {addSubject.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Добавить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Schedule */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Расписание</CardTitle>
                <Button variant="gradient" size="sm" onClick={() => setScheduleDialog(true)} disabled={!subjects?.length}>
                  <Plus className="w-4 h-4 mr-1" />Добавить
                </Button>
              </CardHeader>
              <CardContent>
                {[1, 2, 3, 4, 5, 6, 7].map(day => {
                  const daySchedule = schedule?.filter(s => s.day_of_week === day);
                  if (!daySchedule?.length) return null;
                  return (
                    <div key={day} className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">{dayNames[day]}</h3>
                      <div className="space-y-2">
                        {daySchedule.map(s => (
                          <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-center gap-3">
                              <ClockIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-mono">{s.start_time?.slice(0, 5)}–{s.end_time?.slice(0, 5)}</span>
                              <span className="font-medium">{(s as any).subjects?.name}</span>
                              {s.room && <Badge variant="outline">{s.room}</Badge>}
                            </div>
                            <Button variant="outline" size="icon" onClick={() => { if (confirm('Удалить?')) deleteScheduleEntry.mutate(s.id); }}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {(!schedule || schedule.length === 0) && <p className="text-center text-muted-foreground py-4">Расписание пусто</p>}
              </CardContent>
            </Card>

            <Dialog open={scheduleDialog} onOpenChange={setScheduleDialog}>
              <DialogContent>
                <DialogHeader><DialogTitle>Добавить занятие</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Select value={schedSubject} onValueChange={setSchedSubject}>
                    <SelectTrigger><SelectValue placeholder="Предмет" /></SelectTrigger>
                    <SelectContent>
                      {subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={schedDay} onValueChange={setSchedDay}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(dayNames).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="time" value={schedStart} onChange={e => setSchedStart(e.target.value)} />
                    <Input type="time" value={schedEnd} onChange={e => setSchedEnd(e.target.value)} />
                  </div>
                  <Input placeholder="Аудитория (необязательно)" value={schedRoom} onChange={e => setSchedRoom(e.target.value)} />
                  <Button variant="gradient" className="w-full" onClick={() => addScheduleEntry.mutate()} disabled={!schedSubject || addScheduleEntry.isPending}>
                    {addScheduleEntry.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Добавить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Attendance */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Посещаемость</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="w-[180px]" />
                  <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
                    <SelectTrigger className="w-[300px]"><SelectValue placeholder="Выберите занятие" /></SelectTrigger>
                    <SelectContent>
                      {schedule?.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {dayNames[s.day_of_week]} {s.start_time?.slice(0, 5)} — {(s as any).subjects?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedScheduleId && students && (
                  <div className="space-y-2">
                    {students.map(st => {
                      const record = attendanceMap.get(st.id);
                      const currentStatus = record?.status || 'none';
                      return (
                        <div key={st.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-border">
                              <img src={st.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-sm">{st.nickname}</span>
                            {currentStatus !== 'none' && (
                              <Badge className={statusColors[currentStatus]}>{statusLabels[currentStatus]}</Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {(['present', 'absent', 'late', 'excused'] as const).map(status => (
                              <Button
                                key={status}
                                variant={currentStatus === status ? 'default' : 'outline'}
                                size="sm"
                                className="text-xs px-2"
                                onClick={() => markAttendance.mutate({ studentId: st.id, status })}
                              >
                                {status === 'present' ? '✓' : status === 'absent' ? '✗' : status === 'late' ? '⏰' : '📋'}
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!selectedScheduleId && <p className="text-center text-muted-foreground py-4">Выберите занятие для отметки посещаемости</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
