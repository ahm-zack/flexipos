"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from '@/utils/supabase/client'

const client = createClient();

async function getPizzas() {
await client.auth.getClaims();
return await client.from("pizzas").select();
}

export function TestPizza() {
const { data } = useQuery({
queryKey: ["pizzas"],
queryFn: getPizzas,
staleTime: 1000 _ 60 _ 5, // 5 minutes
});

return <div>{JSON.stringify(data, null, 2)}</div>;
}
