import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Hook to manage doctor block times from the real backend.
 */
export default function useBlockTimes(doctorId) {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/block-times');
      setBlocks(data ?? []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addBlock = useCallback(
    async (block) => {
      try {
        await api.post('/block-times', block);
        await refresh();
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [refresh]
  );

  const removeBlock = useCallback(
    async (id) => {
      try {
        await api.delete(`/block-times/${id}`);
        await refresh();
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [refresh]
  );

  return { blocks, loading, error, refresh, addBlock, removeBlock };
}
