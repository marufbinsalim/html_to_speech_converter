export interface BlogContent {
  id: number;
  created_at: string;
  updated_at: string;
  title: string | null;
  description: string;
  image: string | null;
  video: string | null;
  created_by: number;
  blog: number;
}

export interface BlogContext {
  contexts: BlogContent[];
}