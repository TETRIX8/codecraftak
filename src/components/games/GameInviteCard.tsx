import { GameInvite } from '@/hooks/useGameInvites';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Circle, 
  Hand, 
  Ship,
  Target,
  Check, 
  XCircle, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GameInviteCardProps {
  invite: GameInvite;
  userBalance: number;
  onAccept: (inviteId: string, gameId: string) => void;
  onDecline: (inviteId: string) => void;
  isLoading: boolean;
}

const GAME_NAMES: Record<string, string> = {
  'tic-tac-toe': 'Крестики-нолики',
  'rock-paper-scissors': 'Камень-ножницы-бумага',
  'battleship': 'Морской бой',
  'russian-roulette': 'Русская рулетка'
};

export function GameInviteCard({ 
  invite, 
  userBalance, 
  onAccept, 
  onDecline,
  isLoading 
}: GameInviteCardProps) {
  const gameType = invite.game?.game_type || 'tic-tac-toe';
  const canAccept = userBalance >= 1;

  const GameIcon = () => {
    switch (gameType) {
      case 'tic-tac-toe':
        return <div className="flex gap-0.5"><X className="h-5 w-5" /><Circle className="h-5 w-5" /></div>;
      case 'rock-paper-scissors':
        return <Hand className="h-5 w-5" />;
      case 'battleship':
        return <Ship className="h-5 w-5" />;
      case 'russian-roulette':
        return <Target className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={invite.sender?.avatar_url || undefined} />
              <AvatarFallback>
                {invite.sender?.nickname?.slice(0, 2).toUpperCase() || '??'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{invite.sender?.nickname || 'Игрок'}</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <GameIcon />
                  <span className="text-xs">{GAME_NAMES[gameType]}</span>
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(invite.created_at), { 
                  addSuffix: true, 
                  locale: ru 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDecline(invite.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={isLoading || !canAccept}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Принять
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Подтверждение
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы принимаете приглашение на игру <strong>{GAME_NAMES[gameType]}</strong> от <strong>{invite.sender?.nickname}</strong>.
                    <br /><br />
                    <span className="text-yellow-500 font-medium">
                      Ставка: 1 балл. Победитель получает 2 балла.
                    </span>
                    <br /><br />
                    Ваш текущий баланс: <strong>{userBalance} баллов</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onAccept(invite.id, invite.game_id)}>
                    Играть!
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        {!canAccept && (
          <p className="text-sm text-destructive mt-2">
            Недостаточно баллов для игры (нужен 1 балл)
          </p>
        )}
      </CardContent>
    </Card>
  );
}
