export interface DebugFlags {
  showPrimitiveValidationScene: boolean;
}

export function createDebugFlags(searchParams: URLSearchParams): DebugFlags {
  return {
    showPrimitiveValidationScene: searchParams.get("debugPrimitives") === "1",
  };
}
