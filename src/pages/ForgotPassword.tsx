import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authEmail } from '@/lib/authEmail';
import { toast } from 'sonner';

type Step = 'email' | 'code' | 'password' | 'done';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [loading, setLoading] = useState(false);

  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await authEmail('send_reset_code', { email });
      setStep('code');
      toast.success('Если аккаунт существует, письмо уже отправлено');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Попробуйте ещё раз');
    } finally { setLoading(false); }
  };

  const submitCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await authEmail('verify_reset_code', { email, code });
      setResetToken(result.resetToken || '');
      setStep('password');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Код не принят');
    } finally { setLoading(false); }
  };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return toast.error('Пароль должен содержать минимум 8 символов');
    if (password !== repeat) return toast.error('Пароли не совпадают');
    setLoading(true);
    try {
      await authEmail('reset_password', { email, resetToken, newPassword: password });
      setStep('done');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось изменить пароль');
    } finally { setLoading(false); }
  };

  const stepTitle = step === 'email' ? 'Восстановление пароля' : step === 'code' ? 'Введите код' : 'Новый пароль';
  const stepDescription = step === 'email'
    ? 'Укажите email. Если аккаунт существует, мы отправим на него код восстановления.'
    : step === 'code'
      ? `Код отправлен на ${email}. Он действует 15 минут.`
      : 'Придумайте новый надёжный пароль минимум из 8 символов.';

  return (
    <div className="min-h-screen bg-background px-4 py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-border/60 bg-card shadow-2xl shadow-primary/10 lg:grid-cols-[.85fr_1.15fr]">
        <div className="hidden bg-gradient-to-br from-indigo-700 via-primary to-cyan-500 p-10 text-primary-foreground lg:block">
          <KeyRound className="h-12 w-12" />
          <p className="mt-20 text-sm uppercase tracking-[.25em] opacity-70">Восстановление доступа</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">Вернём вас в обучение.</h1>
          <p className="mt-5 leading-7 text-primary-foreground/75">Безопасный процесс с одноразовым кодом и короткой сессией восстановления.</p>
        </div>
        <div className="p-6 sm:p-10">
          <Link to="/auth" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Ко входу</Link>
          {step === 'done' ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
              <h2 className="mt-6 text-3xl font-bold">Пароль успешно изменён</h2>
              <p className="mt-3 text-muted-foreground">Теперь можно войти с новым паролем.</p>
              <Button className="mt-8" onClick={() => navigate('/auth')}>Войти в аккаунт</Button>
            </div>
          ) : (
            <>
              <div className="mt-12">
                <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">{step === 'email' ? <Mail className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}</div>
                <h2 className="mt-6 text-3xl font-bold">{stepTitle}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{stepDescription}</p>
              </div>
              {step === 'email' && (
                <form onSubmit={submitEmail} className="mt-8 space-y-5">
                  <div><Label htmlFor="reset-email">Email</Label><Input id="reset-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} className="mt-2 h-12" placeholder="you@example.com" /></div>
                  <Button className="h-12 w-full" disabled={loading}>{loading ? 'Отправляем…' : 'Получить код'}</Button>
                </form>
              )}
              {step === 'code' && (
                <form onSubmit={submitCode} className="mt-8 space-y-5">
                  <Input autoFocus inputMode="numeric" maxLength={6} required value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} placeholder="123456" className="h-16 text-center text-3xl font-bold tracking-[.45em]" />
                  <Button className="h-12 w-full" disabled={loading}>{loading ? 'Проверяем…' : 'Подтвердить код'}</Button>
                </form>
              )}
              {step === 'password' && (
                <form onSubmit={submitPassword} className="mt-8 space-y-5">
                  <div><Label htmlFor="new-password">Новый пароль</Label><Input id="new-password" type="password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} className="mt-2 h-12" /></div>
                  <div><Label htmlFor="repeat-password">Повторите пароль</Label><Input id="repeat-password" type="password" required minLength={8} value={repeat} onChange={event => setRepeat(event.target.value)} className="mt-2 h-12" /></div>
                  <Button className="h-12 w-full" disabled={loading}>{loading ? 'Сохраняем…' : 'Изменить пароль'}</Button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
