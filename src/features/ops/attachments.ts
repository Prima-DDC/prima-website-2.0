import { z } from "zod";

// Supporting-file uploads for fund and expense requests. Every file format is
// accepted except types that are a cybersecurity risk (executables, scripts,
// installers, and markup that can carry active content). Validation is by the
// final file extension, so a disguised "invoice.pdf.exe" is still caught.

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10 MB per file
export const MAX_ATTACHMENTS = 10;
// Total size of new files in one submission, kept under the server action body
// limit (see next.config.ts) with headroom for the rest of the payload.
export const MAX_UPLOAD_BATCH_SIZE = 24 * 1024 * 1024;

/** Extensions blocked for security reasons (executables, scripts, active markup). */
export const BLOCKED_EXTENSIONS = new Set([
  // Windows executables / installers / libraries
  "exe", "com", "scr", "pif", "msi", "msp", "mst", "dll", "sys", "cpl",
  "bat", "cmd", "vb", "vbs", "vbe", "js", "jse", "ws", "wsf", "wsc", "wsh",
  "ps1", "ps1xml", "ps2", "psc1", "psc2", "psm1", "msc", "reg", "hta", "scf",
  "lnk", "inf", "gadget", "application", "jar", "cab",
  // Unix / cross-platform executables and scripts
  "sh", "bash", "zsh", "csh", "ksh", "run", "bin", "out", "elf", "so",
  "py", "pyc", "pyo", "pl", "rb", "php", "php3", "php4", "php5", "phtml",
  "asp", "aspx", "jsp", "jspx", "cgi", "app", "command",
  // Mobile / disk images that can execute
  "apk", "ipa", "deb", "rpm", "dmg",
  // Markup that can carry scripts (XSS / active content)
  "html", "htm", "xhtml", "shtml", "svg", "mht", "mhtml", "hta",
]);

export interface Attachment {
  path: string;
  name: string;
  size: number;
  type: string;
}

/** Lower-cased final extension, or "" when there is none. */
export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase().trim() : "";
}

/** A human-readable reason the file is not acceptable, or null when it is fine. */
export function attachmentError(name: string, size: number): string | null {
  const ext = fileExtension(name);
  if (!ext) return `"${name}" has no file extension and cannot be accepted.`;
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return `"${name}" is a ${ext.toUpperCase()} file, which is blocked for security reasons.`;
  }
  if (size > MAX_ATTACHMENT_SIZE) {
    return `"${name}" is larger than ${Math.round(MAX_ATTACHMENT_SIZE / (1024 * 1024))} MB.`;
  }
  return null;
}

/** Stored attachment metadata, validated when a document payload is parsed. */
export const attachmentSchema = z.object({
  path: z.string().min(1).max(500),
  name: z.string().min(1).max(255),
  size: z.number().int().nonnegative().max(MAX_ATTACHMENT_SIZE),
  type: z.string().max(255).default(""),
});

export const attachmentsSchema = z.array(attachmentSchema).max(MAX_ATTACHMENTS).optional();

/** Human-readable size, e.g. "1.2 MB" or "834 KB". */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}
