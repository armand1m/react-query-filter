import alasql from 'alasql';
import type { FilterQueryResult } from './filterToSql';

export interface Volcano {
  name: string;
  country: string;
  continent: string;
  height_m: number;
  last_eruption: string;
  type: string;
  is_active: number; // 1 | 0 for alasql boolean compatibility
}

export const volcanoData: Volcano[] = [
  {
    name: 'Mount Vesuvius',
    country: 'Italy',
    continent: 'Europe',
    height_m: 1281,
    last_eruption: '1944-03-17',
    type: 'Stratovolcano',
    is_active: 0,
  },
  {
    name: 'Mount Etna',
    country: 'Italy',
    continent: 'Europe',
    height_m: 3357,
    last_eruption: '2024-06-22',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Stromboli',
    country: 'Italy',
    continent: 'Europe',
    height_m: 924,
    last_eruption: '2024-07-08',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Eyjafjallajökull',
    country: 'Iceland',
    continent: 'Europe',
    height_m: 1651,
    last_eruption: '2010-04-14',
    type: 'Stratovolcano',
    is_active: 0,
  },
  {
    name: 'Hekla',
    country: 'Iceland',
    continent: 'Europe',
    height_m: 1491,
    last_eruption: '2000-02-26',
    type: 'Stratovolcano',
    is_active: 0,
  },
  {
    name: 'Anak Krakatau',
    country: 'Indonesia',
    continent: 'Asia',
    height_m: 157,
    last_eruption: '2022-02-16',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Mount Merapi',
    country: 'Indonesia',
    continent: 'Asia',
    height_m: 2930,
    last_eruption: '2023-10-22',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Mount Agung',
    country: 'Indonesia',
    continent: 'Asia',
    height_m: 3031,
    last_eruption: '2019-07-04',
    type: 'Stratovolcano',
    is_active: 0,
  },
  {
    name: 'Mount Pinatubo',
    country: 'Philippines',
    continent: 'Asia',
    height_m: 1486,
    last_eruption: '1993-01-01',
    type: 'Stratovolcano',
    is_active: 0,
  },
  {
    name: 'Mayon Volcano',
    country: 'Philippines',
    continent: 'Asia',
    height_m: 2463,
    last_eruption: '2024-06-08',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Taal Volcano',
    country: 'Philippines',
    continent: 'Asia',
    height_m: 311,
    last_eruption: '2022-07-04',
    type: 'Caldera',
    is_active: 1,
  },
  {
    name: 'Sakurajima',
    country: 'Japan',
    continent: 'Asia',
    height_m: 1117,
    last_eruption: '2024-05-25',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Mount Fuji',
    country: 'Japan',
    continent: 'Asia',
    height_m: 3776,
    last_eruption: '1707-12-16',
    type: 'Stratovolcano',
    is_active: 0,
  },
  {
    name: 'Mount St. Helens',
    country: 'USA',
    continent: 'North America',
    height_m: 2549,
    last_eruption: '2008-07-10',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Kilauea',
    country: 'USA',
    continent: 'North America',
    height_m: 1247,
    last_eruption: '2023-09-10',
    type: 'Shield',
    is_active: 1,
  },
  {
    name: 'Mauna Loa',
    country: 'USA',
    continent: 'North America',
    height_m: 4169,
    last_eruption: '2022-11-27',
    type: 'Shield',
    is_active: 1,
  },
  {
    name: 'Mount Rainier',
    country: 'USA',
    continent: 'North America',
    height_m: 4392,
    last_eruption: '1894-01-01',
    type: 'Stratovolcano',
    is_active: 0,
  },
  {
    name: 'Popocatépetl',
    country: 'Mexico',
    continent: 'North America',
    height_m: 5426,
    last_eruption: '2023-05-22',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Cotopaxi',
    country: 'Ecuador',
    continent: 'South America',
    height_m: 5897,
    last_eruption: '2023-05-03',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Galeras',
    country: 'Colombia',
    continent: 'South America',
    height_m: 4276,
    last_eruption: '2010-01-14',
    type: 'Stratovolcano',
    is_active: 0,
  },
  {
    name: 'Mount Erebus',
    country: 'Antarctica',
    continent: 'Antarctica',
    height_m: 3794,
    last_eruption: '2024-01-01',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Nyiragongo',
    country: 'DR Congo',
    continent: 'Africa',
    height_m: 3470,
    last_eruption: '2021-05-22',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Mount Cameroon',
    country: 'Cameroon',
    continent: 'Africa',
    height_m: 4095,
    last_eruption: '2012-07-28',
    type: 'Stratovolcano',
    is_active: 0,
  },
  {
    name: 'Mount Ruapehu',
    country: 'New Zealand',
    continent: 'Oceania',
    height_m: 2797,
    last_eruption: '2007-09-25',
    type: 'Stratovolcano',
    is_active: 1,
  },
  {
    name: 'Whakaari / White Island',
    country: 'New Zealand',
    continent: 'Oceania',
    height_m: 321,
    last_eruption: '2019-12-09',
    type: 'Stratovolcano',
    is_active: 1,
  },
];

interface AlaSQLInstance {
  tables: Record<string, { data: unknown[] }>;
}

// Module-level init — runs once on first import, safe under Vite HMR
alasql('DROP TABLE IF EXISTS volcanoes');
alasql('CREATE TABLE volcanoes');
(alasql as unknown as AlaSQLInstance).tables['volcanoes'].data = volcanoData;

export function queryVolcanoes(query: FilterQueryResult): Volcano[] {
  try {
    return alasql(query.sql, [...query.bindings]);
  } catch (e) {
    console.error('alasql error:', e);
    return [];
  }
}
