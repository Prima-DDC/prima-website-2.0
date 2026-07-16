import { FileIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { deleteMedia } from "@/features/media/actions";
import { CopyButton } from "@/features/media/CopyButton";
import { MediaUploadForm } from "@/features/media/MediaUploadForm";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "public-media";

export default async function MediaAdminPage() {
  const admin = createSupabaseAdminClient();
  const { data: files } = await admin.storage
    .from(BUCKET)
    .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });

  const publicUrl = (path: string) =>
    admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  const items = (files ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder");

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-navy">Media library</h1>
      <p className="mt-1 text-sm text-slate-body">
        Images and documents stored in Supabase Storage. Copy a URL and paste
        it into any content field.
      </p>

      <div className="mt-8">
        <MediaUploadForm />
      </div>

      {items.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-line bg-white p-10 text-center text-sm text-slate-body">
          No files uploaded yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((file) => {
            const url = publicUrl(file.name);
            const isImage = /\.(jpe?g|png|webp|gif|svg)$/i.test(file.name);
            return (
              <div
                key={file.name}
                className="overflow-hidden rounded-lg border border-line bg-white"
              >
                <div className="flex h-36 items-center justify-center bg-mist/50">
                  {isImage ? (
                    <Image
                      src={url}
                      alt={file.name}
                      width={300}
                      height={144}
                      className="h-36 w-full object-contain"
                    />
                  ) : (
                    <FileIcon className="h-10 w-10 text-slate-body/50" aria-hidden />
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-navy" title={file.name}>
                    {file.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <CopyButton text={url} />
                    <form action={deleteMedia}>
                      <input type="hidden" name="path" value={file.name} />
                      <button
                        type="submit"
                        aria-label={`Delete ${file.name}`}
                        className="rounded p-1.5 text-slate-body/60 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
