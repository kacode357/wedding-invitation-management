import { useState, useCallback } from 'react';
import { guestService } from '../../services/guest.service';
import type { Guest } from '../../types/guest/guest.response';

interface UseMarkInvitationSentReturn {
  isLoading: boolean;
  error: string | null;
  markInvitationSent: (id: string | number) => Promise<{ success: boolean; guest?: Guest }>;
}

export function useMarkInvitationSent(): UseMarkInvitationSentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markInvitationSent = useCallback(async (id: string | number): Promise<{ success: boolean; guest?: Guest }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await guestService.markInvitationSent(id);

      if (response.success) {
        return { success: true, guest: response.guest };
      } else {
        setError(response.message || 'Failed to mark invitation as sent');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while marking invitation as sent';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    markInvitationSent,
  };
}
