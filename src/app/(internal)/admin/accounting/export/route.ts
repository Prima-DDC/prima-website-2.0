import { type NextRequest } from "next/server";
import { requireCapability } from "@/features/capabilities/service";
import { getMoneyRows, rowsToCsv } from "@/features/accounting/queries";

/** CSV export of the money-document register, honouring the same filters. */
export async function GET(request: NextRequest) {
  await requireCapability("manage_accounting");
  const sp = request.nextUrl.searchParams;
  const rows = await getMoneyRows({
    branch: sp.get("branch") || undefined,
    status: sp.get("status") || undefined,
    type: sp.get("type") || undefined,
    currency: sp.get("currency") || undefined,
    from: sp.get("from") || undefined,
    to: sp.get("to") || undefined,
  });

  return new Response(rowsToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prima-accounting-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
