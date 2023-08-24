

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import LogoutButton from '../components/LogoutButton'
import QuestionAnswerForm from '../components/QuestionAnswerForm'

export const dynamic = 'force-dynamic'




export default async function Index() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="w-full flex flex-col ">
      <nav className="w-full flex  border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between  p-3 text-sm text-foreground">
          <div />
          <div>
            {user ? (
              <div className="flex gap-4">
                Hey, {user.email}!
                <LogoutButton />
              </div>
            ) : (
              <Link
                href="/login"
                className="py-2 px-4 rounded-md  bg-btn-background hover:bg-btn-background-hover"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="animate-in flex flex-col gap-14 opacity-0 max-w-4xl px-3 py-16 lg:py-24 text-foreground">
        <div className="flex flex-col mb-4 lg:mb-12">
          <div className="flex flex-col gap-4">


            {/* Include the QuestionAnswerForm component here */}
            <QuestionAnswerForm />  
          </div>
        </div>
      </div>

    </div>
  )
}
