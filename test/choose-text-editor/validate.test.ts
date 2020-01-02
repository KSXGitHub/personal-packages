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

    describe('package name and exact version', () => {
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

    describe('package name and tilde version', () => {
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

    describe('package name and caret version', () => {
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

  describe('when chooser package name is different', () => {
    describe('package name and caret version', () => {
      const chooser = 'different@^3.0.0'

      it('returns false', () => {
        expect(setup(chooser).result).toBe(false)
      })

      it('calls callbacks.onInvalidPackageName exactly once', () => {
        expect(setup(chooser).callbacks.onInvalidPackageName).toBeCalledTimes(1)
      })

      it('calls callbacks.onInvalidPackageName with package names', () => {
        expect(setup(chooser).callbacks.onInvalidPackageName).toBeCalledWith(
          expect.any(String),
          PACKAGE_NAME
        )
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

  describe('when chooser package name contains path', () => {
    describe('package name and caret version', () => {
      const path = 'path/after/package/name'
      const chooser = PACKAGE_NAME + '/' + path

      it('returns false', () => {
        expect(setup(chooser).result).toBe(false)
      })

      it('does not call callbacks.onInvalidPackageName', () => {
        expect(setup(chooser).callbacks.onInvalidPackageName).not.toBeCalled()
      })

      it('calls callbacks.onNonEmptyPath exactly once', () => {
        expect(setup(chooser).callbacks.onNonEmptyPath).toBeCalledTimes(1)
      })

      it('calls callbacks.onNonEmptyPath with path', () => {
        expect(setup(chooser).callbacks.onNonEmptyPath).toBeCalledWith(path)
      })

      it('does not call callbacks.onInvalidVersionRange', () => {
        expect(setup(chooser).callbacks.onInvalidVersionRange).not.toBeCalled()
      })

      it('does not call callbacks.onUnsatisfiedVersion', () => {
        expect(setup(chooser).callbacks.onUnsatisfiedVersion).not.toBeCalled()
      })
    })
  })

  describe('when chooser version range is invalid', () => {
    const versionRange = 'InvalidVersionRange'
    const chooser = PACKAGE_NAME + '@' + versionRange

    it('returns false', () => {
      expect(setup(chooser).result).toBe(false)
    })

    it('does not call callbacks.onInvalidPackageName', () => {
      expect(setup(chooser).callbacks.onInvalidPackageName).not.toBeCalled()
    })

    it('does not call callbacks.onNonEmptyPath', () => {
      expect(setup(chooser).callbacks.onNonEmptyPath).not.toBeCalled()
    })

    it('calls callbacks.onInvalidVersionRange exactly once', () => {
      expect(setup(chooser).callbacks.onInvalidVersionRange).toBeCalledTimes(1)
    })

    it('calls callbacks.onInvalidVersionRange with invalid version range', () => {
      expect(setup(chooser).callbacks.onInvalidVersionRange).toBeCalledWith(versionRange)
    })

    it('does not call callbacks.onUnsatisfiedVersion', () => {
      expect(setup(chooser).callbacks.onUnsatisfiedVersion).not.toBeCalled()
    })
  })

  describe('when chooser version is not satisfied', () => {
    describe('chooser version range > used version', () => {
      const versionRange = '>3.2.1'
      const chooser = `@khai96x/choose-text-editor@${versionRange}`

      it('returns false', () => {
        expect(setup(chooser).result).toBe(false)
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

      it('calls callbacks.onUnsatisfiedVersion exactly once', () => {
        expect(setup(chooser).callbacks.onUnsatisfiedVersion).toBeCalledTimes(1)
      })

      it('calls callbacks.onUnsatisfiedVersion with chooser version range and used version', () => {
        expect(setup(chooser).callbacks.onUnsatisfiedVersion).toBeCalledWith(
          versionRange,
          PACKAGE_VERSION
        )
      })
    })

    describe('chooser version range < used version', () => {
      const versionRange = '<3.2.1'
      const chooser = `@khai96x/choose-text-editor@${versionRange}`

      it('returns false', () => {
        expect(setup(chooser).result).toBe(false)
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

      it('calls callbacks.onUnsatisfiedVersion exactly once', () => {
        expect(setup(chooser).callbacks.onUnsatisfiedVersion).toBeCalledTimes(1)
      })

      it('calls callbacks.onUnsatisfiedVersion with chooser version range and used version', () => {
        expect(setup(chooser).callbacks.onUnsatisfiedVersion).toBeCalledWith(
          versionRange,
          PACKAGE_VERSION
        )
      })
    })
  })
})
