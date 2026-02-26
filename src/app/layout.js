
import './globals.css'
import { Montserrat, Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import MemberModal from '@/components/MemberModal'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-display' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata = {
  title: 'Johan Swimming Club | Membangun Generasi Juara',
  description: 'Klub renang profesional dengan pelatih bersertifikasi di Indonesia. Program latihan lengkap untuk pemula hingga atlet prestasi.',
  keywords: ['klub renang', 'kursus renang', 'pelatih renang profesional', 'berenang anak', 'atlet renang', 'johan swimming club'],
  authors: [{ name: 'Johan Swimming Club' }],
  openGraph: {
    title: 'Johan Swimming Club | Membangun Generasi Juara',
    description: 'Bergabunglah dengan klub renang terbaik dengan fasilitas dan pelatih profesional.',
    url: 'https://johan-swimming-club.vercel.app',
    siteName: 'Johan Swimming Club',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Johan Swimming Club | Membangun Generasi Juara',
    description: 'Program latihan renang profesional untuk semua usia.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="min-h-screen font-body bg-gradient-to-br from-blue-50 via-sky-100 to-cyan-50 text-slate-900 overflow-x-hidden">
        <Providers>
          {children}
          <MemberModal />
        </Providers>
      </body>
    </html>
  )
}
