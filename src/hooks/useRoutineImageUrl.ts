import { useEffect, useState } from "react";
import { getRoutineImageById } from "../db/routineRepository";

export function useRoutineImageUrl(imageId?: string) {
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let isActive = true;

    async function loadImage() {
      if (!imageId) {
        setImageUrl(undefined);
        return;
      }

      const image = await getRoutineImageById(imageId);

      if (!image || !isActive) {
        return;
      }

      objectUrl = URL.createObjectURL(image.blob);
      setImageUrl(objectUrl);
    }

    void loadImage();

    return () => {
      isActive = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageId]);

  return imageUrl;
}
