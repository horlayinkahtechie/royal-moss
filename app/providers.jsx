
"use client";

import { createContext, useContext } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import supabase from "./lib/supabase"

const SupabaseContext = createContext(null);

export function useSupabase() {
  return useContext(SupabaseContext);
}

export default function Providers({ children }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}
