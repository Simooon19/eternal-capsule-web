'use client'

import { useState, useEffect } from 'react'
import { client } from '@/lib/sanity'
import Image from 'next/image'
import Link from 'next/link'

interface Memorial {
  _id: string
  name: string
  born: string
  died: string
  status: 'pending' | 'approved' | 'rejected'
  gallery: Array<{
    asset: {
      _ref: string
    }
    alt: string
  }>
  slug: {
    current: string
  }
}

export default function AdminDashboard() {
  const [memorials, setMemorials] = useState<Memorial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemorials()
  }, [])

  const fetchMemorials = async () => {
    try {
      const query = `*[_type == "memorial"] | order(_createdAt desc) {
        _id,
        name,
        born,
        died,
        status,
        gallery,
        slug
      }`
      const result = await client.fetch(query)
      setMemorials(result)
    } catch (error) {
      console.error('Error fetching memorials:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      await client
        .patch(id)
        .set({ status: newStatus })
        .commit()

      // Refresh the list
      fetchMemorials()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Memorial Approvals
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Review and approve pending memorial submissions
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Memorial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {memorials.map((memorial) => (
                    <tr key={memorial._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {memorial.gallery?.[0] && (
                            <div className="flex-shrink-0 h-10 w-10 relative">
                              <Image
                                src={memorial.gallery[0].asset._ref}
                                alt={memorial.gallery[0].alt}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {memorial.name}
                            </div>
                            <Link
                              href={`/memorial/${memorial.slug.current}`}
                              className="text-sm text-copper-600 dark:text-copper-400 hover:text-copper-500"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(memorial.born).getFullYear()} - {new Date(memorial.died).getFullYear()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            memorial.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : memorial.status === 'rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {memorial.status.charAt(0).toUpperCase() + memorial.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {memorial.status === 'pending' && (
                          <div className="space-x-2">
                            <button
                              onClick={() => updateStatus(memorial._id, 'approved')}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(memorial._id, 'rejected')}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 