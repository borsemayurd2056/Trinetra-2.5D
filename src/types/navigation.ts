export type PageId =
  | 'live-perception'
  | 'adaptive-map'
  | 'dynamic-objects'
  | 'terrain-analysis'
  | 'performance'
  | 'benchmark'
  | 'replay'
  | 'settings';

export interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: 'cyan' | 'emerald' | 'amber' | 'violet';
  shortcut: string;
}
