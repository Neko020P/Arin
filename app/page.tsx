"use client";

import { createClient } from '@/lib/supabase/client';
export default function Home() {
  async function test() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();
    console.log('Supabase connected!', data, error);
  }
  return (
    <main>
      <h1>Arin</h1>
      <button onClick={test}>Test Supabase</button>
    </main>
  );
}