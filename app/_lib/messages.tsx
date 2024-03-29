'use client'

import { useSearchParams } from 'next/navigation'

export default function Messages() {
  const searchParams = useSearchParams()

  const error = searchParams ? searchParams.get('error') : null
  const message = searchParams ? searchParams.get('message') : null

  return (
    <>
      {error && (
        <p className="mt-4 p-4 bg-neutral-900 text-neutral-300 text-center" data-cy="error">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 p-4 bg-neutral-900 text-neutral-300 text-center" data-cy="info">
          {message}
        </p>
      )}
    </>
  )
}
