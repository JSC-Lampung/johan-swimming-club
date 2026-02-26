
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const initialPrograms = [
    {
        category: 'program',
        title: 'Kelas Kompetisi',
        content: 'Pelatihan intensif bagi atlet yang ingin berprestasi di kancah nasional dan internasional dengan bimbingan pelatih pro.',
        order_index: 1,
        is_active: true
    },
    {
        category: 'program',
        title: 'Aquatic Fitness',
        content: 'Latihan fisik di dalam air untuk kekuatan otot, kesehatan jantung, dan rehabilitasi tubuh yang aman bagi segala usia.',
        order_index: 2,
        is_active: true
    },
    {
        category: 'program',
        title: 'Umum / Privat',
        content: 'Kelas khusus privat untuk segala usia dari anak-anak hingga dewasa dengan jadwal yang fleksibel sesuai kebutuhan Anda.',
        order_index: 3,
        is_active: true
    }
]

async function seed() {
    console.log('Seeding programs...')
    const { data, error } = await supabase
        .from('landing_contents')
        .insert(initialPrograms)

    if (error) {
        console.error('Error seeding:', error)
    } else {
        console.log('Seeding successful!')
    }
}

seed()
