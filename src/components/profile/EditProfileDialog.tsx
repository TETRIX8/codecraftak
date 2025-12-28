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
  // Avataaars style
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
  // Bottts (robots)
  'https://api.dicebear.com/7.x/bottts/svg?seed=Robot1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Robot2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Android',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyborg',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Mech',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Droid',
  // Pixel art
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel1',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pixel2',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Retro',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Game',
  // Fun emoji
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Smile',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Star',
  // Lorelei
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Artist',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Writer',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Dreamer',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Thinker',
  // Notionists
  'https://api.dicebear.com/7.x/notionists/svg?seed=Notion1',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Notion2',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Notion3',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Notion4',
  // Adventurer
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Hero',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Warrior',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Mage',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Rogue',
  // Big ears
  'https://api.dicebear.com/7.x/big-ears/svg?seed=Elf',
  'https://api.dicebear.com/7.x/big-ears/svg?seed=Fairy',
  'https://api.dicebear.com/7.x/big-ears/svg?seed=Gnome',
  'https://api.dicebear.com/7.x/big-ears/svg?seed=Sprite',
  // Thumbs
  'https://api.dicebear.com/7.x/thumbs/svg?seed=Thumb1',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=Thumb2',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=Thumb3',
  'https://api.dicebear.com/7.x/thumbs/svg?seed=Thumb4',
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
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <motion.button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedAvatar === avatar
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-border hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.015 }}
                  >
                    <img
                      src={avatar}
                      alt={`Аватар ${index + 1}`}
                      className="w-full h-full object-cover bg-muted"
                    />
                    {selectedAvatar === avatar && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
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
