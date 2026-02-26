
export const PROGRAMS = [
    { id: 'pemula', name: 'Kelas Pemula' },
    { id: 'dasar', name: 'Kelas Dasar' },
    { id: 'menengah', name: 'Kelas Menengah' },
    { id: 'prestasi', name: 'Kelas Prestasi' },
    { id: 'privat', name: 'Kelas Privat Latihan Personal' },
    { id: 'fitness', name: 'Kelas Fitness (Umum)' }
]

export const LEVEL_MAPPING = {
    'pemula': { next: 'dasar', label: 'Kelas Pemula' },
    'dasar': { next: 'menengah', label: 'Kelas Dasar' },
    'menengah': { next: 'prestasi', label: 'Kelas Menengah' },
    'prestasi': { next: null, label: 'Kelas Prestasi' },
    'privat': { next: null, label: 'Kelas Privat' },
    'fitness': { next: null, label: 'Kelas Fitness' }
}
