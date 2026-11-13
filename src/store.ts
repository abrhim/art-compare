import { createClient } from "@supabase/supabase-js";

/** Rating scale: 0 dislike, 1 meh, 2 like, 3 love. */
export type Ratings = Record<string, number>;

export interface Participant {
  id: string;
  room_code: string;
  name: string;
  ratings: Ratings;
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const schema = (import.meta.env.VITE_SUPABASE_SCHEMA as string | undefined) || "art_compare";

export const isShared = Boolean(url && key);
const supabase = isShared ? createClient(url!, key!, { db: { schema } }) : null;

// Demo fallback when Supabase is not configured: rooms live in this browser only.
const LOCAL_KEY = "art-compare:demo-rows";
const readLocal = (): Participant[] => JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");

export async function listRoom(roomCode: string): Promise<Participant[]> {
  if (!supabase) return readLocal().filter((p) => p.room_code === roomCode);
  const { data, error } = await supabase
    .from("participants")
    .select("id, room_code, name, ratings")
    .eq("room_code", roomCode)
    .order("created_at");
  if (error) throw new Error(error.message);
  return data as Participant[];
}

export async function saveParticipant(p: Participant): Promise<void> {
  if (!supabase) {
    const rows = readLocal().filter((r) => r.id !== p.id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...rows, p]));
    return;
  }
  const { error } = await supabase
    .from("participants")
    .upsert({ ...p, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

const CODE_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I or O
export const newRoomCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(4)), (n) => CODE_LETTERS[n % CODE_LETTERS.length]).join("");

// Which participant "I" am in each room, remembered per browser.
const meKey = (roomCode: string) => `art-compare:me:${roomCode}`;
export const getMyId = (roomCode: string) => localStorage.getItem(meKey(roomCode));
export const setMyId = (roomCode: string, id: string) => localStorage.setItem(meKey(roomCode), id);
