import { describe, it, expect } from 'vitest'
import { helloCommand } from './hello'

describe('helloCommand', () => {
  it('exists and has name hello', () => {
    const cmd = helloCommand()
    expect(cmd.name()).toBe('hello')
  })

  it('has a description', () => {
    const cmd = helloCommand()
    expect(cmd.description()).toBe('Print a greeting')
  })
})
