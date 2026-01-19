import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: 'Click me',
      },
    })

    expect(wrapper.text()).toContain('Click me')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(BaseButton)

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.length).toBe(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(BaseButton, {
      props: { disabled: true },
    })

    await wrapper.trigger('click')

    // Button is disabled so click handler shouldn't fire
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('shows loading spinner when loading', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true },
      slots: { default: 'Submit' },
    })

    expect(wrapper.find('svg.animate-spin').exists()).toBe(true)
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('applies primary variant classes', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'primary' },
    })

    expect(wrapper.classes()).toContain('bg-primary-600')
  })

  it('applies secondary variant classes', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'secondary' },
    })

    expect(wrapper.classes()).toContain('bg-dark-700')
  })

  it('applies danger variant classes', () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'danger' },
    })

    expect(wrapper.classes()).toContain('bg-red-600')
  })

  it('applies size classes', () => {
    const smWrapper = mount(BaseButton, { props: { size: 'sm' } })
    const lgWrapper = mount(BaseButton, { props: { size: 'lg' } })

    expect(smWrapper.classes()).toContain('px-3')
    expect(lgWrapper.classes()).toContain('px-6')
  })

  it('has correct type attribute', () => {
    const submitWrapper = mount(BaseButton, { props: { type: 'submit' } })
    const buttonWrapper = mount(BaseButton)

    expect(submitWrapper.attributes('type')).toBe('submit')
    expect(buttonWrapper.attributes('type')).toBe('button')
  })
})
