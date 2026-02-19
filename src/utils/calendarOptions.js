import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useDoctorTypes() {
  const { t } = useI18n()
  return computed(() => [
    { title: t('calendar.doctorTypes.general'), value: 'general' },
    { title: t('calendar.doctorTypes.specialist'), value: 'specialist' },
    { title: t('calendar.doctorTypes.dentist'), value: 'dentist' },
    { title: t('calendar.doctorTypes.eye'), value: 'eye' },
    { title: t('calendar.doctorTypes.skin'), value: 'skin' },
    { title: t('calendar.doctorTypes.women'), value: 'women' },
    { title: t('calendar.doctorTypes.men'), value: 'men' },
    { title: t('calendar.doctorTypes.heart'), value: 'heart' },
    { title: t('calendar.doctorTypes.ortho'), value: 'ortho' },
    { title: t('calendar.doctorTypes.neuro'), value: 'neuro' },
    { title: t('calendar.doctorTypes.psych'), value: 'psych' },
    { title: t('calendar.doctorTypes.nephro'), value: 'nephro' },
    { title: t('calendar.doctorTypes.other'), value: 'other' }
  ].sort((a, b) => a.title.localeCompare(b.title)))
}

export function useVaccinationMethods() {
  const { t } = useI18n()
  return computed(() => [
    { title: t('calendar.methods.subcutaneous'), value: 'subcutaneous' },
    { title: t('calendar.methods.intramuscular'), value: 'intramuscular' },
    { title: t('calendar.methods.oral'), value: 'oral' },
    { title: t('calendar.methods.rectal'), value: 'rectal' },
    { title: t('calendar.methods.other'), value: 'other' }
  ])
}
