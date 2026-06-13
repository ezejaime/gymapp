import { useCallback, useState } from "react";
import {
  clearAllData,
  exportAllData,
  importAllDataReplacingCurrentData,
  validateImportedData
} from "../db/backupRepository";

function downloadJson(data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `rutinas-backup-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useBackup() {
  const [error, setError] = useState<string>();
  const [isWorking, setIsWorking] = useState(false);

  const exportBackup = useCallback(async () => {
    setIsWorking(true);
    setError(undefined);

    try {
      downloadJson(await exportAllData());
    } catch {
      setError("No se pudo exportar el backup.");
    } finally {
      setIsWorking(false);
    }
  }, []);

  const importBackup = useCallback(async (file: File) => {
    setIsWorking(true);
    setError(undefined);

    try {
      const parsedData: unknown = JSON.parse(await file.text());

      if (!validateImportedData(parsedData)) {
        setError("El archivo no parece ser un backup válido.");
        return false;
      }

      await importAllDataReplacingCurrentData(parsedData);
      return true;
    } catch {
      setError("No se pudo importar el backup.");
      return false;
    } finally {
      setIsWorking(false);
    }
  }, []);

  const clearLocalData = useCallback(async () => {
    setIsWorking(true);
    setError(undefined);

    try {
      await clearAllData();
      return true;
    } catch {
      setError("No se pudieron limpiar los datos locales.");
      return false;
    } finally {
      setIsWorking(false);
    }
  }, []);

  return {
    clearLocalData,
    error,
    exportBackup,
    importBackup,
    isWorking
  };
}
