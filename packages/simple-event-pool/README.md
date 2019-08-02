# Simple Event Pool

Set up a simple event pool

## Usage

### Create

```javascript
const { createEventPool, some, none } = require('@khai96x/simple-event-pool')

const target = createEventPool({
  setInterval,
  clearInterval,
  delay: 1000 // will call triggers once for every 1000ms
})
  .createAutoTrigger('never', () => none())
  .createAutoTrigger('every second', param => some(param.iterationCount))
  .createAutoTrigger(
    'every 3 seconds',
    param => param.iterationCount % 3 === 0
      ? some(param.iterationCount)
      : none()
  )
  .createAutoTrigger(
    'every 15 seconds',
    param => param.iterationCount % 15 === 0
      ? some(param.iterationCount)
      : none()
  )
  .startEventLoop() // start the interval loop
```

### Add Listener

```javascript
target
  .addListener('never', () => console.log('this message will never show'))
  .addListener('every second', value => console.log('1x', value))
  .addListener('every 3 seconds', value => console.log('3x', value))
  .addListener('every 15 seconds', value => console.log('15x', value))
  .addListener('every 15 seconds', () => target.stopEventLoop())
```

**Expected Output:**

```
1x 1
1x 2
1x 3
3x 3
1x 4
1x 5
1x 6
3x 6
1x 7
1x 8
1x 9
3x 9
1x 10
1x 11
1x 12
3x 12
1x 13
1x 14
1x 15
3x 15
15x 15
```
