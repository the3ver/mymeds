import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PillAvatar from '../../src/modules/meds/components/PillAvatar.vue';

describe('PillAvatar.vue', () => {
  it('renders initial letter when shape is "letter" or undefined', () => {
    const wrapper = mount(PillAvatar, {
      props: {
        shape: 'letter',
        color: 'blue',
        name: 'Aspirin'
      }
    });

    expect(wrapper.text()).toBe('A');
    expect(wrapper.find('svg').exists()).toBe(false);
  });

  it('renders dark letter and border when color is "white" in letter mode', () => {
    const wrapper = mount(PillAvatar, {
      props: {
        shape: 'letter',
        color: 'white',
        name: 'Paracetamol'
      }
    });

    expect(wrapper.text()).toBe('P');
    expect(wrapper.classes()).toContain('pill-avatar--white');
  });

  it('renders SVG for "round" shape', () => {
    const wrapper = mount(PillAvatar, {
      props: {
        shape: 'round',
        color: 'red',
        name: 'Ibuprofen'
      }
    });

    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('[data-shape="round"]').exists()).toBe(true);
  });

  it('renders SVG with score line for "round-score" shape', () => {
    const wrapper = mount(PillAvatar, {
      props: {
        shape: 'round-score',
        color: 'white',
        name: 'Novaminsulfon'
      }
    });

    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('[data-shape="round-score"]').exists()).toBe(true);
    expect(wrapper.find('.pill-score-line').exists()).toBe(true);
  });

  it('renders dual-color capsule with cap and body for "capsule" shape', () => {
    const wrapper = mount(PillAvatar, {
      props: {
        shape: 'capsule',
        color: 'deep-orange',
        name: 'Omeprazol'
      }
    });

    expect(wrapper.find('svg').exists()).toBe(true);
    expect(wrapper.find('[data-shape="capsule"]').exists()).toBe(true);
    expect(wrapper.find('.capsule-cap').exists()).toBe(true);
    expect(wrapper.find('.capsule-body').exists()).toBe(true);
  });

  it('renders specialty shapes: heart and drop', () => {
    const wrapperHeart = mount(PillAvatar, {
      props: { shape: 'heart', color: 'red', name: 'ASS' }
    });
    expect(wrapperHeart.find('[data-shape="heart"]').exists()).toBe(true);

    const wrapperDrop = mount(PillAvatar, {
      props: { shape: 'drop', color: 'blue', name: 'Drops' }
    });
    expect(wrapperDrop.find('[data-shape="drop"]').exists()).toBe(true);
  });

  it('applies scaling based on pillSize prop', () => {
    const wrapperSmall = mount(PillAvatar, {
      props: { shape: 'round', color: 'red', name: 'Mini', pillSize: 'small' }
    });
    expect(wrapperSmall.find('.pill-graphic-scaled').attributes('style')).toContain('scale(0.65)');

    const wrapperLarge = mount(PillAvatar, {
      props: { shape: 'round', color: 'red', name: 'Maxi', pillSize: 'large' }
    });
    expect(wrapperLarge.find('.pill-graphic-scaled').attributes('style')).toContain('scale(1)');
  });
});
