import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseToggle from '../BaseToggle.vue'

describe('BaseToggle', () => {
  it('renders with label', () => {
    const wrapper = mount(BaseToggle, {
      props: {
        modelValue: false,
        label: 'Enable Feature',
      },
    })

    expect(wrapper.text()).toContain('Enable Feature')
  })

  it('renders with description', () => {
    const wrapper = mount(BaseToggle, {
      props: {
        modelValue: false,
        description: 'This enables a cool feature',
      },
    })

    expect(wrapper.text()).toContain('This enables a cool feature')
  })

  it('emits update:modelValue when clicked', async () => {
    const wrapper = mount(BaseToggle, {
      props: { modelValue: false },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('toggles from true to false', async () => {
    const wrapper = mount(BaseToggle, {
      props: { modelValue: true },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('applies correct classes when on', () => {
    const wrapper = mount(BaseToggle, {
      props: { modelValue: true },
    })

    expect(wrapper.find('button').classes()).toContain('bg-primary-600')
  })

  it('applies correct classes when off', () => {
    const wrapper = mount(BaseToggle, {
      props: { modelValue: false },
    })

    expect(wrapper.find('button').classes()).toContain('bg-dark-600')
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(BaseToggle, {
      props: {
        modelValue: false,
        disabled: true,
      },
    })

    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('has correct aria-checked attribute', () => {
    const wrapperOn = mount(BaseToggle, { props: { modelValue: true } })
    const wrapperOff = mount(BaseToggle, { props: { modelValue: false } })

    expect(wrapperOn.find('button').attributes('aria-checked')).toBe('true')
    expect(wrapperOff.find('button').attributes('aria-checked')).toBe('false')
  })
})
