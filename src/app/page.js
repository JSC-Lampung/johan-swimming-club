import { supabaseAdmin as supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import CategorySection from '@/components/CategorySection'
import Link from 'next/link'

export const revalidate = 60 // Revalidate every minute

export default async function Home() {
  const { data: contents } = await supabase.from('landing_contents').select('*').eq('is_active', true).order('order_index', { ascending: true }) || { data: [] }
  const { data: siteConfig } = await supabase.from('landing_contents').select('*').eq('category', 'site_config') || { data: [] }

  // Fetch dynamic categories
  let { data: categories } = await supabase.from('content_categories').select('*').order('order_index', { ascending: true }) || { data: [] }

  // Fallback categories if table is empty or doesn't exist
  if (!categories || categories.length === 0) {
    categories = [
      { id: '1', name: 'Intro Landing', slug: 'hero_intro', icon: 'Layout', description: 'Hero section content.' },
      { id: '2', name: 'Program', slug: 'program', icon: 'Waves', description: 'Daftar program latihan.' },
      { id: '3', name: 'Prestasi Anggota', slug: 'achievement', icon: 'Trophy', description: 'Daftar pencapaian dan medali.' },
      { id: '4', name: 'Team Pelatih', slug: 'team', icon: 'Users', description: 'Profil pelatih profesional.' },
      { id: '5', name: 'Berita / Info', slug: 'news', icon: 'Newspaper', description: 'Berita dan update terbaru.' }
    ]
  }

  const clubSlogan = siteConfig?.find(c => c.title === 'club_slogan')?.content || 'Membangun Generasi Juara'

  const heroIntro = contents?.find(c => c.category === 'hero_intro') || {
    title: 'Jadi Perenang <span class="text-blue-600">Profesional</span>',
    content: 'Bergabunglah dengan klub renang terbaik dengan pelatih bersertifikasi.'
  }


  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main id="landing-page" className="w-full">
        {/* Section 1: Hero */}
        <HeroSection clubSlogan={clubSlogan} heroIntro={heroIntro} />

        {/* Section 2: Dynamic Categories (Main Navigation) */}
        <CategorySection categories={categories} />
      </main>

      <Footer />
    </div>
  )
}

