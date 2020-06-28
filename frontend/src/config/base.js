export const APP_SLUG = 'protest-live';
export const APP_TITLE = 'Protest Live';

export const PRIMARY_COLOR = '#2f80ed';
export const SECONDARY_COLOR = 'red';
export const DANGER_COLOR = 'red';

export const { REACT_APP_IS_DEV: IS_DEV } = process.env;

export const POI_CATEGORIES = [
  { label: 'Incidents', icon: '🚨', tagLine: 'Avoid these areas' },
  { label: 'First Aid', icon: '⛑', tagLine: 'Emergency help centers' },
  {
    label: 'Water',
    icon: '🚰',
    headingLabel: 'Water Points',
    tagLine: 'Public water points',
  },
  { label: 'Restrooms', icon: '🚻', tagLine: 'Public restrooms' },
  { label: 'Police', icon: '🚔', tagLine: 'Law enforcement' },
];
