"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import type { Modifier } from "@/lib/schemas";

interface ModifiersFieldProps {
  value: Modifier[];
  onChange: (modifiers: Modifier[]) => void;
}

export function ModifiersField({ value, onChange }: ModifiersFieldProps) {
  const [editing, setEditing] = useState<Modifier | null>(null);
  const [form, setForm] = useState({
    type: "extra" as Modifier["type"],
    name: "",
    price: 0,
  });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onChange([...value, { id: uuidv4(), ...form }]);
    setForm({ type: "extra", name: "", price: 0 });
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((m) => m.id !== id));
  };

  const handleEdit = (modifier: Modifier) => {
    setEditing(modifier);
    setForm({
      type: modifier.type,
      name: modifier.name,
      price: modifier.price,
    });
  };

  const handleUpdate = () => {
    if (!editing) return;
    onChange(
      value.map((m) => (m.id === editing.id ? { ...editing, ...form } : m))
    );
    setEditing(null);
    setForm({ type: "extra", name: "", price: 0 });
  };

  return (
    <div className="space-y-2">
      <Label>Modifiers</Label>
      <div className="flex gap-2">
        <select
          value={form.type}
          onChange={(e) =>
            setForm((f) => ({ ...f, type: e.target.value as Modifier["type"] }))
          }
          className="border rounded px-2 py-1"
        >
          <option value="extra">Extra</option>
          <option value="without">Without</option>
        </select>
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Input
          type="number"
          min={0}
          placeholder="Price"
          value={form.price}
          onChange={(e) =>
            setForm((f) => ({ ...f, price: Number(e.target.value) }))
          }
        />
        {editing ? (
          <Button type="button" onClick={handleUpdate}>
            Update
          </Button>
        ) : (
          <Button type="button" onClick={handleAdd}>
            Add
          </Button>
        )}
      </div>
      <ul className="space-y-1">
        {value.map((modifier) => (
          <li key={modifier.id} className="flex items-center gap-2">
            <span className="font-mono text-xs bg-gray-100 rounded px-2 py-1">
              {modifier.type}
            </span>
            <span>{modifier.name}</span>
            <span className="text-xs text-gray-500">SAR {modifier.price}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleEdit(modifier)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => handleRemove(modifier.id)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
