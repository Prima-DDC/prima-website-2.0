-- Media enrichment: content blocks can carry an image from the media bucket.
alter table public.content_blocks
  add column if not exists image_path text;
