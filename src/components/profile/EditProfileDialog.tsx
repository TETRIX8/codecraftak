import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProfile, Profile } from '@/hooks/useProfile';
import { toast } from 'sonner';

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Coder',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ninja',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Hacker',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Pro',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Master',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Expert',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Guru',
];

interface EditProfileDialogProps {
  profile: Profile;
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState(profile.nickname);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar_url);
  const updateProfile = useUpdateProfile();

  const handleSave = async () => {
    if (!nickname.trim()) {
      toast.error('Введите никнейм');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        nickname: nickname.trim(),
        avatar_url: selectedAvatar,
      });
      toast.success('Профиль обновлён');
      setOpen(false);
    } catch (error) {
      toast.error('Ошибка при обновлении профиля');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="w-4 h-4" />
          Редактировать
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname">Никнейм</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Введите никнейм"
              maxLength={20}
            />
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label>Выберите аватар</Label>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map((avatar, index) => (
                <motion.button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedAvatar === avatar
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <img
                    src={avatar}
                    alt={`Аватар ${index + 1}`}
                    className="w-full h-full object-cover bg-muted"
                  />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button 
            variant="gradient" 
            onClick={handleSave}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
