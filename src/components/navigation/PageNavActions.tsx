import { ArrowLeft, House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type PageNavActionsProps = {
  backPath?: string;
  className?: string;
  homePath?: string;
  onBeforeNavigate?: () => boolean;
};

export default function PageNavActions({
  backPath,
  className,
  homePath = '/',
  onBeforeNavigate,
}: PageNavActionsProps) {
  const navigate = useNavigate();

  const canLeave = () => onBeforeNavigate?.() ?? true;

  const handleBack = () => {
    if (!canLeave()) {
      return;
    }

    if (backPath) {
      navigate(backPath);
      return;
    }

    const historyIndex = Number(window.history.state?.idx ?? 0);

    if (historyIndex > 0) {
      navigate(-1);
      return;
    }

    navigate(homePath);
  };

  const handleHome = () => {
    if (canLeave()) {
      navigate(homePath);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      <Button type="button" variant="outline" onClick={handleBack} className="h-10 rounded-xl font-bold">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button type="button" variant="outline" onClick={handleHome} className="h-10 rounded-xl font-bold">
        <House className="mr-2 h-4 w-4" />
        Home
      </Button>
    </div>
  );
}
