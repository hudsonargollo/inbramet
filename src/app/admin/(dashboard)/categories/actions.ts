"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { refreshStorefront } from "@/lib/cache-tags";
import { dbErrorKind } from "@/lib/db-errors";

export type CategoryState = { error?: string; ok?: boolean };

const schema = z.object({
  name: z.string().min(2, "Informe um nome para a categoria"),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export async function createCategory(
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { name, slug, description } = parsed.data;
  try {
    await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug ? slugify(slug) : slugify(name),
        description: description?.trim() || null,
      },
    });
  } catch (err) {
    const kind = dbErrorKind(err);
    if (kind === "duplicate") return { error: "Já existe uma categoria com esse nome ou slug." };
    if (kind === "unavailable")
      return { error: "Banco de dados indisponível. Tente novamente." };
    return { error: "Não foi possível criar a categoria." };
  }
  refreshStorefront();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  let flash = "category-deleted";
  try {
    await prisma.category.delete({ where: { id } });
  } catch (err) {
    flash = dbErrorKind(err) === "in-use" ? "category-in-use" : "delete-failed";
  }
  refreshStorefront();
  redirect(`/admin/categories?flash=${flash}`);
}
