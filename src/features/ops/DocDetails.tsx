import {
  DOC_CONFIG,
  documentTotal,
  formatMoney,
  type DocType,
} from "./config";

/** Read-only rendering of a document payload, driven by the type config. */
export function DocDetails({
  docType,
  data,
}: {
  docType: DocType;
  data: Record<string, unknown>;
}) {
  const config = DOC_CONFIG[docType];
  const total = documentTotal(docType, data);
  const currency = String(data.currency ?? "GHS");

  return (
    <div>
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {config.fields.map((field) => {
          const value = data[field.name];
          if (value == null || value === "") return null;
          return (
            <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-body">
                {field.label}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-navy">
                {field.type === "number" && field.name === "amount"
                  ? formatMoney(Number(value), currency)
                  : String(value)}
              </dd>
            </div>
          );
        })}
      </dl>

      {config.lineItems ? (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-body">
            {config.lineItems.label}
          </p>
          <div className="mt-2 overflow-x-auto rounded-md border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-mist/60 text-xs uppercase tracking-wider text-slate-body">
                <tr>
                  {config.lineItems.columns.map((col) => (
                    <th key={col.name} className="px-4 py-2.5 font-semibold">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {((data[config.lineItems.name] as Array<Record<string, unknown>>) ?? []).map(
                  (item, i) => (
                    <tr key={i}>
                      {config.lineItems!.columns.map((col) => (
                        <td key={col.name} className="px-4 py-2.5 text-navy">
                          {col.type === "number" && col.name !== "quantity"
                            ? formatMoney(Number(item[col.name]), currency)
                            : String(item[col.name] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          {total !== null ? (
            <p className="mt-3 text-right text-sm font-bold text-brand-dark">
              Total: {formatMoney(total, currency)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
