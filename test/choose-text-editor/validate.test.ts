import { validateChooser } from '@khai96x/choose-text-editor'

describe('validateChooser', () => {
  const PACKAGE_NAME = '@khai96x/choose-text-editor'
  const PACKAGE_VERSION = '3.2.1'

  class Callbacks {
    public readonly onInvalidPackageName = jest.fn()
    public readonly onNonEmptyPath = jest.fn()
    public readonly onInvalidVersionRange = jest.fn()
    public readonly onUnsatisfiedVersion = jest.fn()
  }

  function setup (chooser: string) {
    const callbacks = new Callbacks()
    const result = validateChooser(chooser, PACKAGE_NAME, PACKAGE_VERSION, callbacks)
    return { chooser, callbacks, result }
  }

  describe('when chooser is valid', () => {
    describe('just package name', () => {
      const chooser = '@khai96x/choose-text-editor'

      it('returns true', () => {
        expect(setup(chooser).result).toBe(true)
      })

      it('does not call callbacks.onInvalidPackageName', () => {
        expect(setup(chooser).callbacks.onInvalidPackageName).not.toBeCalled()
      })

      it('does not call callbacks.onNonEmptyPath', () => {
        expect(setup(chooser).callbacks.onNonEmptyPath).not.toBeCalled()
      })

      it('does not call callbacks.onInvalidVersionRange', () => {
        expect(setup(chooser).callbacks.onInvalidVersionRange).not.toBeCalled()
      })

      it('does not call callbacks.onUnsatisfiedVersion', () => {
        expect(setup(chooser).callbacks.onUnsatisfiedVersion).not.toBeCalled()
      })
    })

    describe(`package name and exact version`, () => {
      const chooser = '@khai96x/choose-text-editor@3.2.1'

      it('returns true', () => {
        expect(setup(chooser).result).toBe(true)
      })

      it('does not call callbacks.onInvalidPackageName', () => {
        expect(setup(chooser).callbacks.onInvalidPackageName).not.toBeCalled()
      })

      it('does not call callbacks.onNonEmptyPath', () => {
        expect(setup(chooser).callbacks.onNonEmptyPath).not.toBeCalled()
      })

      it('does not call callbacks.onInvalidVersionRange', () => {
        expect(setup(chooser).callbacks.onInvalidVersionRange).not.toBeCalled()
      })

      it('does not call callbacks.onUnsatisfiedVersion', () => {
        expect(setup(chooser).callbacks.onUnsatisfiedVersion).not.toBeCalled()
      })
    })

    describe(`package name and tilde version`, () => {
      const chooser = '@khai96x/choose-text-editor@~3.2.0'

      it('returns true', () => {
        expect(setup(chooser).result).toBe(true)
      })

      it('does not call callbacks.onInvalidPackageName', () => {
        expect(setup(chooser).callbacks.onInvalidPackageName).not.toBeCalled()
      })

      it('does not call callbacks.onNonEmptyPath', () => {
        expect(setup(chooser).callbacks.onNonEmptyPath).not.toBeCalled()
      })

      it('does not call callbacks.onInvalidVersionRange', () => {
        expect(setup(chooser).callbacks.onInvalidVersionRange).not.toBeCalled()
      })

      it('does not call callbacks.onUnsatisfiedVersion', () => {
        expect(setup(chooser).callbacks.onUnsatisfiedVersion).not.toBeCalled()
      })
    })

    describe(`package name and caret version`, () => {
      const chooser = '@khai96x/choose-text-editor@^3.0.0'

      it('returns true', () => {
        expect(setup(chooser).result).toBe(true)
      })

      it('does not call callbacks.onInvalidPackageName', () => {
        expect(setup(chooser).callbacks.onInvalidPackageName).not.toBeCalled()
      })

      it('does not call callbacks.onNonEmptyPath', () => {
        expect(setup(chooser).callbacks.onNonEmptyPath).not.toBeCalled()
      })

      it('does not call callbacks.onInvalidVersionRange', () => {
        expect(setup(chooser).callbacks.onInvalidVersionRange).not.toBeCalled()
      })

      it('does not call callbacks.onUnsatisfiedVersion', () => {
        expect(setup(chooser).callbacks.onUnsatisfiedVersion).not.toBeCalled()
      })
    })
  })
})
