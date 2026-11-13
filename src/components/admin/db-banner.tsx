export function DbBanner() {
  return (
    <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Banco de dados não conectado.</strong> Os dados e alterações do painel exigem um banco
      PostgreSQL ativo. Configure <code>DATABASE_URL</code> em <code>.env</code> e execute{" "}
      <code>npx prisma migrate dev</code> e <code>npm run db:seed</code>.
    </div>
  );
}
