import { useNavigate } from 'react-router-dom';
import { LogIn, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import {
  examConfigToSearchParams,
  type ExamConfig,
} from '@/src/data/exam';

type StartExamButtonProps = {
  config: ExamConfig;
  className?: string;
  label?: string;
};

export default function StartExamButton({
  config,
  className,
  label = 'Start Test',
}: StartExamButtonProps) {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleClick = async () => {
    if (!user) {
      const signedIn = await login();

      if (!signedIn) {
        return;
      }
    }

    navigate(`/exam/rules?${examConfigToSearchParams(config).toString()}`);
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {user ? <PlayCircle className="mr-2 h-4 w-4" /> : <LogIn className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
}
