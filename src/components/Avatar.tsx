import Image from "next/image";

const AVATAR_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/`;

/** Staff photo with an initials fallback. */
export function Avatar({
  photoPath,
  name,
  size = 40,
  className = "",
}: {
  photoPath: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  if (photoPath) {
    return (
      <Image
        src={`${AVATAR_BASE}${photoPath}`}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials || "?"}
    </span>
  );
}
