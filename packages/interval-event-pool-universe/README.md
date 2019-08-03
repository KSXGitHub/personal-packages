# Interval Event Pool Universe

A pool of interval event pool

## Usage

```javascript
const { INTERVAL_EVENT, getEventPool } = require('@khai96x/interval-event-pool-universe')

const target = getEventPool(1000)
  .addListener(INTERVAL_EVENT, function listener (param) {
    if (param.intervalCount === 10) {
      target.removeListener(INTERVAL_EVENT, listener)
      target.stopEventLoop()
    } else {
      console.log(param)
    }
  })
```

**Expected Output:**

```
IntervalEventParam { intervalDelay: 1000, intervalCount: 1 }
IntervalEventParam { intervalDelay: 1000, intervalCount: 2 }
IntervalEventParam { intervalDelay: 1000, intervalCount: 3 }
IntervalEventParam { intervalDelay: 1000, intervalCount: 4 }
IntervalEventParam { intervalDelay: 1000, intervalCount: 5 }
IntervalEventParam { intervalDelay: 1000, intervalCount: 6 }
IntervalEventParam { intervalDelay: 1000, intervalCount: 7 }
IntervalEventParam { intervalDelay: 1000, intervalCount: 8 }
IntervalEventParam { intervalDelay: 1000, intervalCount: 9 }
```

## Notes

1. Event loop will start immediately after its creation

2. Providing the same delay value returns the same event pool, and providing different delay values gives different event pool

```javascript
assert.equal(
  getEventPool(1000),
  getEventPool(1000)
)

assert.notEqual(
  getEventPool(1000),
  getEventPool(1001)
)
```

## License

[MIT](https://git.io/fj9XO) © [Hoàng Văn Khải](https://github.com/KSXGitHub)
