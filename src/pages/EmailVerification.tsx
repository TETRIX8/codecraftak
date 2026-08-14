import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, MailCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authEmail } from '@/lib/authEmail';
import { toast } from 'sonner';

export default function EmailVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const email = params.get('email') || '';
  const userId = params.get('userId') || undefined;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== 6) return toast.error('Введите шестизначный код');
    setLoading(true);
    try {
      await authEmail('verify_signup_code', { email, code });
      setVerified(true);
      toast.success('Email подтверждён');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось подтвердить код');
    } finally { setLoading(false); }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    try {
      await authEmail('send_signup_code', { email, userId });
      setCooldown(60); setCode(''); toast.success('Новый код отправлен');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Не удалось отправить код'); }
  };

  return <div className="min-h-screen bg-background px-4 py-20"><div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl shadow-primary/10 lg:grid-cols-[.85fr_1.15fr]"><div className="hidden bg-gradient-to-br from-primary via-indigo-600 to-accent p-10 text-primary-foreground lg:block"><MailCheck className="h-12 w-12" /><p className="mt-20 text-sm uppercase tracking-[.25em] opacity-70">Безопасность аккаунта</p><h1 className="mt-4 text-4xl font-black leading-tight">Ещё один шаг — и вы внутри.</h1><p className="mt-5 leading-7 text-primary-foreground/75">Подтверждение email защищает ваш аккаунт и открывает весь учебный маршрут MOKSUHUB.</p></div><div className="p-6 sm:p-10"><Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Вернуться ко входу</Link>{verified ? <div className="py-16 text-center"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" /><h2 className="mt-6 text-3xl font-bold">Email подтверждён</h2><p className="mt-3 text-muted-foreground">Теперь можно войти и продолжить обучение.</p><Button className="mt-8" onClick={() => navigate('/auth')}>Перейти ко входу</Button></div> : <><div className="mt-12"><div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary"><ShieldCheck className="h-7 w-7" /></div><h2 className="mt-6 text-3xl font-bold">Подтвердите электронную почту</h2><p className="mt-3 leading-7 text-muted-foreground">Мы отправили код на <strong className="text-foreground">{email || 'ваш email'}</strong>. Введите его ниже — код действует 15 минут.</p></div><form onSubmit={verify} className="mt-8 space-y-5"><Input autoFocus inputMode="numeric" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} placeholder="123456" className="h-16 text-center text-3xl font-bold tracking-[.45em]" /><Button className="h-12 w-full" disabled={loading}>{loading ? 'Проверяем…' : 'Подтвердить email'}</Button></form><div className="mt-6 flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-muted-foreground"><Clock3 className="h-4 w-4" /> {cooldown ? `Повтор через ${cooldown} сек.` : 'Можно отправить снова'}</span><button type="button" disabled={cooldown > 0} onClick={resend} className="font-medium text-primary disabled:opacity-40">Отправить код снова</button></div></>}</div></div></div>;
}
