import { command } from '@khai96x/shebang'

it('matches snapshot', () => {
  const result = [
    '#!/bin/sh',
    '#!/usr/bin/sh',
    '#!/bin/env sh',
    '#!/usr/bin/env sh -',
    '#! /bin/bash',
    '#! /usr/bin/bash',
    '#! /bin/env bash',
    '#! /usr/bin/env bash -',
    'not-shebang',
  ].map(shebang => ({
    shebang,
    command: command(shebang),
  }))
  expect(result).toMatchSnapshot()
})
