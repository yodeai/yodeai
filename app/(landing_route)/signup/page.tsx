import Link from 'next/link'
import Messages from '@lib/messages'

export default function Signup() {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">

      <form
        className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        action="/api/auth/sign-up"
        method="post"
      >
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />
        
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />

        <label className="text-md" htmlFor="signup_code">
          Signup Code
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="signup_code"
          placeholder="Signup Code"
          required
        />

        <button className="bg-green-700 rounded px-4 py-2 text-white mb-2">
          Sign Up
        </button>
        <Messages />
      </form>
      <Link href="/login">Already have an account? Log in</Link>
    </div>
  )
}
