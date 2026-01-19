import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from '../BaseInput.vue'

describe('BaseInput', () => {
  it('renders with label', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        label: 'Test Label',
      },
    })

    expect(wrapper.find('label').text()).toBe('Test Label')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(BaseInput, {
      props: { modelValue: '' },
    })

    const input = wrapper.find('input')
    await input.setValue('test value')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['test value'])
  })

  it('handles number type correctly', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: 0,
        type: 'number',
      },
    })

    const input = wrapper.find('input')
    await input.setValue('42')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([42])
  })

  it('shows error message when provided', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        error: 'This field is required',
      },
    })

    expect(wrapper.find('.text-red-400').text()).toBe('This field is required')
  })

  it('shows hint when no error', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        hint: 'Enter your name',
      },
    })

    expect(wrapper.find('.text-dark-400').text()).toBe('Enter your name')
  })

  it('applies disabled attribute', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
        disabled: true,
      },
    })

    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('applies min/max attributes for number input', () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: 5,
        type: 'number',
        min: 0,
        max: 10,
        step: 1,
      },
    })

    const input = wrapper.find('input')
    expect(input.attributes('min')).toBe('0')
    expect(input.attributes('max')).toBe('10')
    expect(input.attributes('step')).toBe('1')
  })
})
