/* eslint-disable jsx-a11y/alt-text -- @react-pdf Image has no alt prop */
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  documentTotal,
  formatMoney,
  type DocType,
} from "../config";

const BRAND = "#018f55";
const BRAND_DARK = "#00492b";
const NAVY = "#1e2a54";
const SLATE = "#45506b";
const LINE = "#dde5e0";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: SLATE,
    paddingTop: 40,
    paddingHorizontal: 48,
    paddingBottom: 64,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
    paddingBottom: 14,
    marginBottom: 24,
  },
  logo: { width: 64, height: 64, objectFit: "contain" },
  orgBlock: { textAlign: "right" },
  orgName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY },
  orgMeta: { fontSize: 8, color: SLATE, marginTop: 2 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: NAVY },
  docMeta: { marginTop: 6, fontSize: 9, color: SLATE },
  section: { marginTop: 18 },
  label: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: BRAND_DARK,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  value: { fontSize: 10.5, color: NAVY, lineHeight: 1.5 },
  table: { marginTop: 8, borderWidth: 1, borderColor: LINE, borderRadius: 2 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LINE },
  trLast: { flexDirection: "row" },
  th: {
    flex: 1,
    padding: 6,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#ffffff",
    backgroundColor: NAVY,
  },
  td: { flex: 1, padding: 6, fontSize: 9.5, color: SLATE },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 12,
  },
  totalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: SLATE },
  totalValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: BRAND_DARK },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: SLATE },
  approvalBox: {
    marginTop: 28,
    padding: 12,
    borderWidth: 1,
    borderColor: BRAND,
    borderRadius: 3,
    backgroundColor: "#f2faf6",
  },
});

export interface PdfInput {
  docType: DocType;
  docNumber: string;
  data: Record<string, unknown>;
  submitterName: string;
  approverName: string;
  logo: Buffer;
}

const str = (v: unknown) => (v == null ? "" : String(v));

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function ItemsTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tr}>
        {headers.map((h) => (
          <Text key={h} style={styles.th}>
            {h}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View key={i} style={i === rows.length - 1 ? styles.trLast : styles.tr}>
          {row.map((cell, j) => (
            <Text key={j} style={styles.td}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function CertificatePage({ input }: { input: PdfInput }) {
  const d = input.data;
  return (
    <Page size="A4" orientation="landscape" style={{ padding: 36 }}>
      <View
        style={{
          flex: 1,
          borderWidth: 3,
          borderColor: BRAND_DARK,
          padding: 6,
        }}
      >
        <View
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: BRAND,
            alignItems: "center",
            justifyContent: "center",
            padding: 36,
          }}
        >
          <Image src={input.logo} style={{ width: 130, height: 130, objectFit: "contain" }} />
          <Text
            style={{
              marginTop: 18,
              fontSize: 10,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: SLATE,
            }}
          >
            Certificate of Honour
          </Text>
          <Text
            style={{
              marginTop: 22,
              fontSize: 30,
              fontFamily: "Times-Bold",
              color: NAVY,
            }}
          >
            {str(d.recipientName)}
          </Text>
          <View style={{ width: 120, height: 2, backgroundColor: BRAND, marginTop: 12 }} />
          <Text
            style={{
              marginTop: 18,
              fontSize: 11,
              color: SLATE,
              textAlign: "center",
              maxWidth: 480,
              lineHeight: 1.6,
            }}
          >
            {str(d.achievement)}
          </Text>
          <Text style={{ marginTop: 26, fontSize: 9, color: SLATE }}>
            Awarded on {str(d.eventDate)} | {input.docNumber}
          </Text>
          <View
            style={{
              marginTop: 30,
              flexDirection: "row",
              gap: 90,
              alignItems: "flex-end",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <View style={{ width: 140, borderBottomWidth: 1, borderBottomColor: SLATE }} />
              <Text style={{ marginTop: 4, fontSize: 8, color: SLATE }}>
                {input.approverName}
              </Text>
              <Text style={{ fontSize: 7, color: SLATE }}>
                Authorized signatory, PRIMA Due Diligence Consult
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
}

function BodyByType({ input }: { input: PdfInput }) {
  const d = input.data;
  switch (input.docType) {
    case "fund_request":
      return (
        <>
          <Field label="Purpose" value={str(d.purpose)} />
          <Field
            label="Amount requested"
            value={formatMoney(Number(d.amount), str(d.currency))}
          />
          <Field label="Needed by" value={str(d.neededBy)} />
          <Field label="Details" value={str(d.details)} />
        </>
      );
    case "expense_form": {
      const items = d.items as Array<{ description: string; amount: number }>;
      const total = documentTotal("expense_form", d) ?? 0;
      return (
        <>
          <Field label="Expense summary" value={str(d.title)} />
          <View style={styles.section}>
            <Text style={styles.label}>Expense items</Text>
            <ItemsTable
              headers={["Description", "Amount"]}
              rows={items.map((item) => [
                item.description,
                formatMoney(item.amount, str(d.currency)),
              ])}
            />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatMoney(total, str(d.currency))}
              </Text>
            </View>
          </View>
          <Field label="Notes" value={str(d.notes)} />
        </>
      );
    }
    case "leave_form":
      return (
        <>
          <Field label="Type of leave" value={str(d.leaveType)} />
          <Field label="First day" value={str(d.startDate)} />
          <Field label="Last day" value={str(d.endDate)} />
          <Field label="Reason / handover notes" value={str(d.reason)} />
        </>
      );
    case "invoice": {
      const items = d.items as Array<{
        description: string;
        quantity: number;
        unitPrice: number;
      }>;
      const total = documentTotal("invoice", d) ?? 0;
      return (
        <>
          <Field label="Billed to" value={`${str(d.clientName)}\n${str(d.clientAddress)}`} />
          <Field label="Payment due" value={str(d.dueDate)} />
          <View style={styles.section}>
            <Text style={styles.label}>Invoice items</Text>
            <ItemsTable
              headers={["Description", "Qty", "Unit price", "Line total"]}
              rows={items.map((item) => [
                item.description,
                String(item.quantity),
                formatMoney(item.unitPrice, str(d.currency)),
                formatMoney(item.quantity * item.unitPrice, str(d.currency)),
              ])}
            />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total due</Text>
              <Text style={styles.totalValue}>
                {formatMoney(total, str(d.currency))}
              </Text>
            </View>
          </View>
          <Field label="Payment terms / notes" value={str(d.notes)} />
        </>
      );
    }
    default:
      return null;
  }
}

const TYPE_TITLES: Record<DocType, string> = {
  honour_certificate: "Certificate of Honour",
  fund_request: "Fund Request",
  expense_form: "Expense Form",
  leave_form: "Leave Request",
  invoice: "Invoice",
};

export function DocumentPdf(input: PdfInput) {
  if (input.docType === "honour_certificate") {
    return (
      <Document title={`${TYPE_TITLES[input.docType]} ${input.docNumber}`}>
        <CertificatePage input={input} />
      </Document>
    );
  }

  return (
    <Document title={`${TYPE_TITLES[input.docType]} ${input.docNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src={input.logo} style={styles.logo} />
          <View style={styles.orgBlock}>
            <Text style={styles.orgName}>PRIMA Due Diligence Consult</Text>
            <Text style={styles.orgMeta}>Trusted Intelligence for Critical Decisions</Text>
            <Text style={styles.orgMeta}>www.primaddc.com | info@primaddc.com</Text>
          </View>
        </View>

        <Text style={styles.title}>{TYPE_TITLES[input.docType]}</Text>
        <Text style={styles.docMeta}>
          {input.docNumber} | Issued {new Date().toISOString().slice(0, 10)} |
          Submitted by {input.submitterName}
        </Text>

        <BodyByType input={input} />

        <View style={styles.approvalBox}>
          <Text style={styles.label}>Approval</Text>
          <Text style={styles.value}>
            Approved by {input.approverName}, PRIMA Due Diligence Consult
          </Text>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            PRIMA Due Diligence Consult | Accra | Tamale | Kigali
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
