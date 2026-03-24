export interface Template {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: number;
  user_id: string;
  name: string;
  target_muscle_group?: string;
  notes?: string;
  created_at: string;
}
