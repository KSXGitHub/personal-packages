export enum Status {
  Success = 0,
  UnexpectedException = 1,
  IndeterminableTTY = 2,
  NotFound = 3,
  InvalidEditorSet = 4,
  ConfigLoadingFailure = 5,
  EmptyConfig = 6,
  ConfigNotFound = 7,
  ExecutionFailure = 8,
  UnsatisfiedChooser = 9
}

export default Status
