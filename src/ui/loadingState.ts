export function formatLoadingProgress(progress: number): string {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  return `${Math.round(clampedProgress * 100)}%`;
}
