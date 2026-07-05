const ASSET_BASE_URL = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "") ?? "";

export function r2Asset(path: string): string {
  return `${ASSET_BASE_URL}/assets/${path.replace(/^\/+/, "")}`;
}
