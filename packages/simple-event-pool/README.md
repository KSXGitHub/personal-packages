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

<code><pre>1x <font color="#C3A000">1</font>
1x <font color="#C3A000">2</font>
1x <font color="#C3A000">3</font>
3x <font color="#C3A000">3</font>
1x <font color="#C3A000">4</font>
1x <font color="#C3A000">5</font>
1x <font color="#C3A000">6</font>
3x <font color="#C3A000">6</font>
1x <font color="#C3A000">7</font>
1x <font color="#C3A000">8</font>
1x <font color="#C3A000">9</font>
3x <font color="#C3A000">9</font>
1x <font color="#C3A000">10</font>
1x <font color="#C3A000">11</font>
1x <font color="#C3A000">12</font>
3x <font color="#C3A000">12</font>
1x <font color="#C3A000">13</font>
1x <font color="#C3A000">14</font>
1x <font color="#C3A000">15</font>
3x <font color="#C3A000">15</font>
15x <font color="#C3A000">15</font>
</pre></code>
