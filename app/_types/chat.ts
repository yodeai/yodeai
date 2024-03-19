import { User } from "./users";

export type ChatMessage = {
  id: number;
  created_at: string;
  lens_id: number;
  user_id: string;
  message: string;
  users: User
}