"use client";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/database.types";
import { useQuery } from "@tanstack/react-query";

const client = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function getPizzas() {
  return await client.from("pizzas").select();
}

export function TestPizza() {
  const { data } = useQuery({
    queryKey: ["pizzas"],
    queryFn: getPizzas,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return <div>{JSON.stringify(data, null, 2)}</div>;
}
