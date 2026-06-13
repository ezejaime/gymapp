export type Routine = {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  cover_image_blob_id?: string;
  created_at: string;
  updated_at: string;
};

export type RoutineImage = {
  id: string;
  blob: Blob;
  mime_type: string;
  created_at: string;
};
