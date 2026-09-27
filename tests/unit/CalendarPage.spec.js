import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createI18n } from 'vue-i18n';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { messages } from '../../src/i18n';
import CalendarPage from '../../src/modules/calendar/components/CalendarPage.vue';

const vuetify = createVuetify({ components, directives });
const i18n = createI18n({ legacy: false, locale: 'de', fallbackLocale: 'en', messages });

describe('CalendarPage.vue', () => {
  const sampleEntries = [
    { title: 'Zukunftstermin', date: '2026-11-20', type: 'doctor', doctor: 'Dr. Z' },
    { title: 'Vergangener Termin', date: '2026-01-10', type: 'vaccination', agent: 'BioNTech' },
    { title: 'Notiz', date: '2026-05-15', type: 'note', notes: 'Blutdruck gut' },
  ];

  const mountComponent = (props = {}) => {
    return mount(CalendarPage, {
      props: {
        initialEntries: sampleEntries,
        ...props,
      },
      global: {
        plugins: [vuetify, i18n],
        stubs: {
          EntryTypeDialog: true,
          CalendarEntryDialog: true,
          ConfirmDialog: true,
          FilterDialog: true,
        },
      },
    });
  };

  it('should render all calendar entries sorted newest first', () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain('Zukunftstermin');
    expect(wrapper.text()).toContain('Vergangener Termin');
    expect(wrapper.text()).toContain('Notiz');
  });

  it('should include "separator-today" in grouped entries', () => {
    const wrapper = mountComponent();
    const todaySeparator = wrapper.find('#separator-today');

    expect(todaySeparator.exists()).toBe(true);
  });

  it('should calculate and display virtual quarter headers', () => {
    const wrapper = mountComponent();

    // With entries in Jan (Q1) and Nov (Q4), quarters between them should be present
    expect(wrapper.text()).toContain('Q1/2026');
    expect(wrapper.text()).toContain('Q4/2026');
  });

  it('should expose methods to open filter and type dialogs', () => {
    const wrapper = mountComponent();

    expect(typeof wrapper.vm.openFilterDialog).toBe('function');
    expect(typeof wrapper.vm.openTypeDialog).toBe('function');

    wrapper.vm.openFilterDialog();
    expect(wrapper.vm.filterDialog).toBe(true);

    wrapper.vm.openTypeDialog();
    expect(wrapper.vm.typeDialog).toBe(true);
  });

  it('should show confirmation dialog before deleting an entry and only delete upon confirmation', async () => {
    const wrapper = mountComponent();
    expect(wrapper.vm.entries.length).toBe(3);

    // Call delete request for index 0
    wrapper.vm.requestDeleteEntry(0);
    await wrapper.vm.$nextTick();

    // Dialog should be open, entry should NOT be deleted yet
    expect(wrapper.vm.confirmDeleteDialog).toBe(true);
    expect(wrapper.vm.entries.length).toBe(3);

    // Confirm deletion
    wrapper.vm.confirmDelete();
    await wrapper.vm.$nextTick();

    // Dialog closed and entry deleted
    expect(wrapper.vm.confirmDeleteDialog).toBe(false);
    expect(wrapper.vm.entries.length).toBe(2);
  });

  it('should render referral status chip on doctor entry card when needsReferral is true', () => {
    const entries = [
      {
        title: 'Kardiologe Termin',
        date: '2026-11-20',
        type: 'doctor',
        doctor: 'Dr. Herz',
        location: 'Herzzentrum',
        needsReferral: true,
        referralStatus: 'needed'
      },
      {
        title: 'Routine Kontrolltermin',
        date: '2026-11-22',
        type: 'doctor',
        doctor: 'Dr. Check',
        needsReferral: false
      }
    ];

    const wrapper = mountComponent({ initialEntries: entries });
    const text = wrapper.text();
    expect(text).toContain('Kardiologe Termin');
    expect(text).toContain('Zu besorgen');
  });

  it('should dynamically show submitted referral status on all appointments for the same location and quarter', () => {
    const entries = [
      {
        title: 'Nierenambulanz Termin 1',
        date: '2026-10-05',
        type: 'doctor',
        doctor: 'Dr. A',
        location: 'Nierenambulanz FFM',
        needsReferral: true,
        referralStatus: 'submitted'
      },
      {
        title: 'Nierenambulanz Termin 2',
        date: '2026-11-20',
        type: 'doctor',
        doctor: 'Dr. B',
        location: 'Nierenambulanz FFM',
        needsReferral: true,
        referralStatus: 'needed'
      }
    ];

    const wrapper = mountComponent({ initialEntries: entries });
    const entry0 = wrapper.find('#entry-0');
    const entry1 = wrapper.find('#entry-1');
    expect(entry0.text()).toContain('Abgegeben');
    expect(entry1.text()).toContain('Abgegeben');
  });

  it('should render referral banner when future doctor visits need a referral', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    const entries = [
      {
        title: 'Zukunft Facharzt',
        date: futureDateStr,
        type: 'doctor',
        needsReferral: true,
        referralStatus: 'needed'
      },
      {
        title: 'Vergangenheit Facharzt',
        date: pastDateStr,
        type: 'doctor',
        needsReferral: true,
        referralStatus: 'needed'
      }
    ];

    const wrapper = mountComponent({ initialEntries: entries });
    const banner = wrapper.find('.referral-alert-banner');
    expect(banner.exists()).toBe(true);
    expect(banner.text()).toContain('Für 1 anstehenden Arzttermin muss noch eine Überweisung besorgt werden.');
  });

  it('should not render referral banner when all upcoming referrals are present or submitted', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const entries = [
      {
        title: 'Zukunft Facharzt 1',
        date: futureDateStr,
        type: 'doctor',
        needsReferral: true,
        referralStatus: 'present'
      },
      {
        title: 'Zukunft Facharzt 2',
        date: futureDateStr,
        type: 'doctor',
        needsReferral: true,
        referralStatus: 'submitted'
      }
    ];

    const wrapper = mountComponent({ initialEntries: entries });
    const banner = wrapper.find('.referral-alert-banner');
    expect(banner.exists()).toBe(false);
  });

  it('should filter entries to only upcoming appointments requiring a referral when open_referrals filter is active', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const pastDateStr = pastDate.toISOString().split('T')[0];

    const entries = [
      {
        title: 'Anstehend ohne Überweisung',
        date: futureDateStr,
        type: 'doctor',
        needsReferral: true,
        referralStatus: 'needed',
      },
      {
        title: 'Anstehend mit Überweisung',
        date: futureDateStr,
        type: 'doctor',
        needsReferral: true,
        referralStatus: 'present',
      },
      {
        title: 'Vergangen ohne Überweisung',
        date: pastDateStr,
        type: 'doctor',
        needsReferral: true,
        referralStatus: 'needed',
      },
      {
        title: 'Anstehende Impfung',
        date: futureDateStr,
        type: 'vaccination',
      },
    ];

    const wrapper = mountComponent({ initialEntries: entries });
    expect(wrapper.text()).toContain('Anstehend ohne Überweisung');
    expect(wrapper.text()).toContain('Anstehend mit Überweisung');
    expect(wrapper.text()).toContain('Vergangen ohne Überweisung');
    expect(wrapper.text()).toContain('Anstehende Impfung');

    wrapper.vm.filterTypes = ['open_referrals'];
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('Anstehend ohne Überweisung');
    expect(wrapper.text()).not.toContain('Anstehend mit Überweisung');
    expect(wrapper.text()).not.toContain('Vergangen ohne Überweisung');
    expect(wrapper.text()).not.toContain('Anstehende Impfung');

    expect(wrapper.text()).toContain('Offene Überweisungen');

    wrapper.vm.clearFilter();
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Anstehend mit Überweisung');
  });

  it('should not show appointment under open_referrals if covered by another submitted referral in same quarter and location', async () => {
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 5);
    const futureDateStr1 = futureDate1.toISOString().split('T')[0];

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 15);
    const futureDateStr2 = futureDate2.toISOString().split('T')[0];

    const entries = [
      {
        title: 'Praxisbesuch 1',
        date: futureDateStr1,
        type: 'doctor',
        location: 'Gemeinschaftspraxis',
        needsReferral: true,
        referralStatus: 'submitted',
      },
      {
        title: 'Praxisbesuch 2',
        date: futureDateStr2,
        type: 'doctor',
        location: 'Gemeinschaftspraxis',
        needsReferral: true,
        referralStatus: 'needed',
      },
    ];

    const wrapper = mountComponent({ initialEntries: entries });
    wrapper.vm.filterTypes = ['open_referrals'];
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain('Praxisbesuch 1');
    expect(wrapper.text()).not.toContain('Praxisbesuch 2');
  });
});
