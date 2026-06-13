export interface DebugFlags {
  showPrimitiveValidationScene: boolean;
  enableHubDebugHotkeys: boolean;
}

export function createDebugFlags(searchParams: URLSearchParams): DebugFlags {
  return {
    enableHubDebugHotkeys: searchParams.get("debugHubs") === "1",
    showPrimitiveValidationScene: searchParams.get("debugPrimitives") === "1",
  };
}
