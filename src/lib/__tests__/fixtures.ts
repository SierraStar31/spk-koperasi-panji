export interface TestFixture {
  nama: string;
  simpanan: number;
  pinjamanDiajukan: number;
  urgensi: number;
  tanggungan: number;
  umur: number;
  expectedScores: {
    c1: number;
    c2: number;
    c3: number;
    c4: number;
    c5: number;
  };
}

export const testFixtures: TestFixture[] = [
  {
    nama: "Nurul Ida Katiyem",
    simpanan: 3875000,
    pinjamanDiajukan: 3000000,
    urgensi: 3,
    tanggungan: 1,
    umur: 53,
    expectedScores: { c1: 4, c2: 5, c3: 3, c4: 2, c5: 4 },
  },
  {
    nama: "Siti Aminah",
    simpanan: 3197000,
    pinjamanDiajukan: 2000000,
    urgensi: 2,
    tanggungan: 2,
    umur: 45,
    expectedScores: { c1: 3, c2: 4, c3: 2, c4: 3, c5: 3 },
  },
  {
    nama: "Siti Fatimah",
    simpanan: 3575000,
    pinjamanDiajukan: 1500000,
    urgensi: 3,
    tanggungan: 0,
    umur: 72,
    expectedScores: { c1: 4, c2: 3, c3: 3, c4: 1, c5: 5 },
  },
  {
    nama: "Ramnah Widiati",
    simpanan: 3645000,
    pinjamanDiajukan: 3000000,
    urgensi: 1,
    tanggungan: 0,
    umur: 52,
    expectedScores: { c1: 4, c2: 5, c3: 1, c4: 1, c5: 4 },
  },
  {
    nama: "Dewi Erlina",
    simpanan: 3052000,
    pinjamanDiajukan: 2500000,
    urgensi: 1,
    tanggungan: 3,
    umur: 52,
    expectedScores: { c1: 3, c2: 5, c3: 1, c4: 4, c5: 4 },
  },
  {
    nama: "Kartinah",
    simpanan: 2450000,
    pinjamanDiajukan: 2000000,
    urgensi: 2,
    tanggungan: 3,
    umur: 38,
    expectedScores: { c1: 1, c2: 4, c3: 2, c4: 4, c5: 2 },
  },
  {
    nama: "Aminatun",
    simpanan: 2275000,
    pinjamanDiajukan: 3000000,
    urgensi: 2,
    tanggungan: 1,
    umur: 52,
    expectedScores: { c1: 1, c2: 5, c3: 2, c4: 2, c5: 4 },
  },
];
