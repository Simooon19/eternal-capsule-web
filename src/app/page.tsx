import { client } from '@/lib/sanity';
import { urlForImage } from '@/lib/sanity';
import MemorialCard from '@/components/MemorialCard';
import { Memorial } from '@/types/memorial';

export const revalidate = 3600 // Revalidate every hour

export default async function Home() {
  const featuredMemorials = await client.fetch(`*[_type == "memorial" && status == "approved"] | order(_createdAt desc)[0...2] {
    _id,
    name,
    born,
    died,
    description,
    gallery,
    slug
  }`);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Hero Section */}
      <div className="relative w-full h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-90" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-6">Eternal Capsule</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Explore beautiful digital memorials that honor lives and keep memories alive for generations to come.
          </p>
          <a
            href="/memorial/explore"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors"
          >
            Explore Memorials
          </a>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose Eternal Capsule?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Digital Preservation",
                description: "Store photos, stories, and memories in a secure, cloud-based platform that will last for generations."
              },
              {
                title: "Easy Sharing",
                description: "Share your memorial with family and friends through a simple, secure link or QR code."
              },
              {
                title: "Interactive Features",
                description: "Allow visitors to leave messages, share memories, and contribute to the memorial."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Memorials Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Memorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredMemorials.map((memorial: Memorial) => (
            <MemorialCard key={memorial._id} memorial={memorial} />
          ))}
        </div>
      </section>
    </main>
  );
}
