"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "./toast";

// Server actions can't fire client toasts, and successful auth/product actions
// end in a redirect. So they redirect with `?flash=<key>` and this component —
// mounted once at the root — shows the matching toast on the destination page,
// then strips the param. It watches pathname/searchParams (not just mount) so it
// fires on client-side navigations too, since the root layout never re-mounts.
const MESSAGES: Record<
  string,
  { variant: "success" | "error" | "info"; message: string; title?: string }
> = {
  login: { variant: "success", message: "Bem-vindo de volta!", title: "Sessão iniciada" },
  register: { variant: "success", message: "Bem-vindo à Inbramet ✨", title: "Conta criada" },
  "admin-login": { variant: "success", message: "Sessão iniciada no painel.", title: "Painel" },
  "signed-out": { variant: "info", message: "Você saiu da sua conta." },
  "product-created": { variant: "success", message: "Produto criado.", title: "Salvo" },
  "product-updated": { variant: "success", message: "Produto atualizado.", title: "Salvo" },
  "product-deleted": { variant: "success", message: "Produto excluído." },
  "product-in-use": {
    variant: "error",
    message: "Este produto aparece em pedidos anteriores e não pode ser excluído. Desmarque «Ativo» para ocultá-lo.",
    title: "Não excluído",
  },
  "category-deleted": { variant: "success", message: "Categoria excluída." },
  "category-in-use": {
    variant: "error",
    message: "Esta categoria ainda possui produtos. Mova ou exclua os produtos primeiro.",
    title: "Não excluída",
  },
  "delete-failed": { variant: "error", message: "Não foi possível excluir. Tente novamente.", title: "Não excluído" },
  "password-reset": { variant: "success", message: "Sua senha foi atualizada.", title: "Pronto" },
  "email-verified": { variant: "success", message: "Seu e-mail está verificado.", title: "Obrigado" },
  "verify-send-failed": {
    variant: "error",
    message: "Não foi possível enviar o código de verificação agora. Tente novamente em instantes.",
    title: "Não enviado",
  },
};

function FlashToastInner() {
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firedFor = useRef("");

  useEffect(() => {
    const key = searchParams.get("flash");
    if (!key) return;

    // fire once per (path + key) so it doesn't repeat under dev StrictMode
    const sig = `${pathname}|${key}`;
    if (firedFor.current === sig) return;
    firedFor.current = sig;

    const entry = MESSAGES[key];
    if (entry) {
      const opts = entry.title ? { title: entry.title } : undefined;
      if (entry.variant === "success") toast.success(entry.message, opts);
      else if (entry.variant === "error") toast.error(entry.message, opts);
      else toast.info(entry.message, opts);
    }

    // Remove the flash param without a reload or extra history entry.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("flash");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, searchParams, toast, router]);

  return null;
}

export function FlashToast() {
  // useSearchParams must be inside a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <FlashToastInner />
    </Suspense>
  );
}
