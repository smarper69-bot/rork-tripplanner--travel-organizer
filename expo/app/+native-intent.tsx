export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  if (path.startsWith('/join/') || path.startsWith('/shared/') || path.startsWith('/invite/')) {
    console.log('[NativeIntent] Allowing public route:', path);
    return path;
  }

  if (path.startsWith('/trip/')) {
    console.log('[NativeIntent] Allowing trip route:', path);
    return path;
  }

  if (initial) {
    return '/';
  }

  return path;
}
