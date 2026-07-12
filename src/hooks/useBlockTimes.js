import { useCallback, useEffect, useState } from "react";
import { LOCAL_UPDATE_EVENT, readCollection, STORAGE_KEYS, writeCollection } from "../utils/storage";

export default function useBlockTimes(doctorId) {
  const [all, setAll] = useState(() => readCollection(STORAGE_KEYS.blockTime));

  const refresh = useCallback(() => {
    setAll(readCollection(STORAGE_KEYS.blockTime));
  }, []);

  useEffect(() => {
    const onExternalChange = (e) => {
      if (e.key === STORAGE_KEYS.blockTime) refresh();
    };
    const onLocalChange = (e) => {
      if (e.detail?.key === STORAGE_KEYS.blockTime) refresh();
    };

    window.addEventListener("storage", onExternalChange);
    window.addEventListener(LOCAL_UPDATE_EVENT, onLocalChange);
    return () => {
      window.removeEventListener("storage", onExternalChange);
      window.removeEventListener(LOCAL_UPDATE_EVENT, onLocalChange);
    };
  }, [refresh]);

  const addBlock = useCallback(
    (block) => {
      const current = readCollection(STORAGE_KEYS.blockTime);
      const next = [...current, { ...block, doctorId }];
      writeCollection(STORAGE_KEYS.blockTime, next);
      setAll(next);
    },
    [doctorId]
  );

  const removeBlock = useCallback((index) => {
    const current = readCollection(STORAGE_KEYS.blockTime);
    const next = current.filter((_, i) => i !== index);
    writeCollection(STORAGE_KEYS.blockTime, next);
    setAll(next);
  }, []);

  const blocks = all.filter((b) => b.doctorId === doctorId);

  return { blocks, addBlock, removeBlock };
}
