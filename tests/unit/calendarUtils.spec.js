import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createCalendarEvent,
  createDetailedCalendarEvent
} from '../../src/modules/calendar/utils/calendarUtils';
import { downloadIcsEvent } from '../../src/modules/calendar/utils/calendar';

describe('calendarUtils & calendar', () => {
  let createdFiles = [];
  let clickedElements = [];

  beforeEach(() => {
    createdFiles = [];
    clickedElements = [];

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn((blobOrFile) => {
      if (blobOrFile instanceof File || blobOrFile instanceof Blob) {
        createdFiles.push(blobOrFile);
      }
      return 'blob:mock-url';
    });
    global.URL.revokeObjectURL = vi.fn();

    // Mock document.createElement('a')
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = vi.fn(() => {
          clickedElements.push({
            href: el.href,
            download: el.download
          });
        });
      }
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createCalendarEvent', () => {
    it('should generate a valid ICS file for simple restock reminder', async () => {
      // Disable navigator.share for this test to trigger download fallback
      Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true });
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });

      const testDate = new Date(2026, 8, 15); // Sept 15, 2026
      createCalendarEvent('Meds running low', 'Please reorder Aspirin', testDate, 'https://mymeds.app');

      expect(createdFiles.length).toBe(1);
      const file = createdFiles[0];
      expect(file.name).toBe('mymeds_reminder.ics');
      expect(file.type).toBe('text/calendar');

      const content = await file.text();
      expect(content).toContain('BEGIN:VCALENDAR');
      expect(content).toContain('VERSION:2.0');
      expect(content).toContain('UID:restock-reminder@mymeds.app');
      expect(content).toContain('DTSTART;VALUE=DATE:20260915');
      expect(content).toContain('SUMMARY:Meds running low');
      expect(content).toContain('DESCRIPTION:Please reorder Aspirin');
      expect(content).toContain('URL:https://mymeds.app');
      expect(content).toContain('END:VCALENDAR');

      expect(clickedElements.length).toBe(1);
      expect(clickedElements[0].download).toBe('mymeds_reminder.ics');
    });

    it('should invoke navigator.share when supported', async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      const canShareMock = vi.fn().mockReturnValue(true);

      Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true });
      Object.defineProperty(navigator, 'share', { value: shareMock, configurable: true });

      const testDate = new Date(2026, 8, 15);
      createCalendarEvent('Meds reminder', 'Check stock', testDate);

      expect(canShareMock).toHaveBeenCalled();
      expect(shareMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Meds reminder',
          text: 'Check stock',
        })
      );
      // Download fallback should NOT be triggered on successful share
      expect(clickedElements.length).toBe(0);
    });

    it('should fallback to download if navigator.share rejects', async () => {
      const shareMock = vi.fn().mockRejectedValue(new Error('User cancelled'));
      const canShareMock = vi.fn().mockReturnValue(true);

      Object.defineProperty(navigator, 'canShare', { value: canShareMock, configurable: true });
      Object.defineProperty(navigator, 'share', { value: shareMock, configurable: true });

      const testDate = new Date(2026, 8, 15);
      createCalendarEvent('Meds reminder', 'Check stock', testDate);

      // Wait a tick for catch block to run
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(shareMock).toHaveBeenCalled();
      expect(clickedElements.length).toBe(1);
    });
  });

  describe('createDetailedCalendarEvent', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true });
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    });

    it('should create detailed doctor appointment event with location and notes', async () => {
      const entry = {
        title: 'Dr. Müller Kardiologie',
        date: '2026-10-20',
        type: 'doctor',
        doctor: 'Dr. med. Müller',
        doctorType: 'Kardiologe',
        location: 'Praxisklinik Süd, Raum 102',
        treatments: 'EKG, Belastungstest',
        notes: 'Nüchtern erscheinen.\nVorher Blutdruck messen.'
      };

      createDetailedCalendarEvent(entry);

      expect(createdFiles.length).toBe(1);
      const file = createdFiles[0];
      expect(file.name).toBe('mymeds_event.ics');

      const content = await file.text();
      expect(content).toContain('BEGIN:VCALENDAR');
      expect(content).toContain('SUMMARY:Dr. Müller Kardiologie');
      expect(content).toContain('DTSTART;VALUE=DATE:20261020');
      expect(content).toContain('LOCATION:Praxisklinik Süd, Raum 102');
      expect(content).toContain('Doctor: Dr. med. Müller');
      expect(content).toContain('Type: Kardiologe');
      expect(content).toContain('Treatments: EKG, Belastungstest');
      expect(content).toContain('Notes:\\nNüchtern erscheinen.\\nVorher Blutdruck messen.');

      expect(clickedElements.length).toBe(1);
      expect(clickedElements[0].download).toBe('dr__m_ller_kardiologie.ics');
    });

    it('should format vaccination entry correctly', async () => {
      const entry = {
        title: 'Grippeimpfung 2026',
        date: '2026-11-05',
        type: 'vaccination',
        agent: 'Influvac Tetra',
        method: 'i.m.',
        bodyPart: 'Oberarm links',
        notes: 'Impfpass mitbringen'
      };

      createDetailedCalendarEvent(entry);

      const file = createdFiles[0];
      const content = await file.text();
      expect(content).toContain('SUMMARY:Grippeimpfung 2026');
      expect(content).toContain('Agent: Influvac Tetra');
      expect(content).toContain('Method: i.m.');
      expect(content).toContain('Body Part: Oberarm links');
    });

    it('should format illness entry correctly with pathogen and symptoms', async () => {
      const entry = {
        title: 'Magen-Darm Infekt',
        date: '2026-03-01',
        endDate: '2026-03-05',
        type: 'illness',
        pathogen: 'Norovirus',
        symptoms: 'Übelkeit, Fieber',
        notes: 'Viel trinken'
      };

      createDetailedCalendarEvent(entry);

      const file = createdFiles[0];
      const content = await file.text();
      expect(content).toContain('SUMMARY:Magen-Darm Infekt');
      expect(content).toContain('Pathogen: Norovirus');
      expect(content).toContain('Symptoms: Übelkeit, Fieber');
      expect(content).toContain('End Date: 2026-03-05');
    });

    it('should format note entry correctly', async () => {
      const entry = {
        title: 'Allergietest Ergebnisse',
        date: '2026-04-10',
        endDate: '2026-04-12',
        type: 'note',
        notes: 'Pollenallergie festgestellt'
      };

      createDetailedCalendarEvent(entry);

      const file = createdFiles[0];
      const content = await file.text();
      expect(content).toContain('SUMMARY:Allergietest Ergebnisse');
      expect(content).toContain('End Date: 2026-04-12');
      expect(content).toContain('Notes:\\nPollenallergie festgestellt');
    });
  });

  describe('downloadIcsEvent (calendar.js)', () => {
    it('should create and trigger download for a timed event', async () => {
      const start = new Date('2026-05-10T14:30:00.000Z');
      downloadIcsEvent({
        title: 'Besprechung Arzt',
        description: 'Befundbesprechung',
        start,
        durationMinutes: 45
      });

      expect(createdFiles.length).toBe(1);
      const blob = createdFiles[0];
      const content = await blob.text();

      expect(content).toContain('BEGIN:VCALENDAR');
      expect(content).toContain('BEGIN:VEVENT');
      expect(content).toContain('SUMMARY:Besprechung Arzt');
      expect(content).toContain('DESCRIPTION:Befundbesprechung');
      expect(content).toContain('DTSTART:20260510T143000Z');
      expect(content).toContain('DTEND:20260510T151500Z'); // 45 mins later

      expect(clickedElements.length).toBe(1);
      expect(clickedElements[0].download).toBe('termin.ics');
    });
  });
});
