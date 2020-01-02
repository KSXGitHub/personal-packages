export enum Status {
  Success = 0,
  IndeterminableTTY = 1,
  NotFound = 2,
  InvalidEditorSet = 3,
  ConfigLoadingFailure = 4,
  EmptyConfig = 5,
  ConfigNotFound = 6,
  ExecutionFailure = 7,
  UnsatisfiedChooser = 8,
  UnknownFailure = 255
}

export default Status
