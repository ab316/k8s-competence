export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
}

export interface CreateNoteResponse {
  note: Note;
}

export interface WhoAmIResponse {
  podName: string;
  instanceId: string;
  timestamp: string;
}

export interface HealthResponse {
  status: "ok" | "error";
  database: "up" | "down";
  podName: string;
  instanceId: string;
  timestamp: string;
  error?: string;
}
