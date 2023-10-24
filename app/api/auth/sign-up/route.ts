import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = 'force-dynamic'


async function isValidSignupCode(signupCode, supabase) {
  const { data, error } = await supabase
    .from('signup_code')
    .select('id, used')
    .eq('code', signupCode)
    .single();
  
  if (error) {
    console.error('Error fetching signup code:', error);
    return false;
  }
  
  if (data && !data.used) {
    console.log("marking as used");
    console.log(data);
    // Mark code as used
   await supabase
      .from('signup_code')
      .update({ used: true })
      .eq('id', data.id);
    return true;
  }

  return false;
}


export async function POST(request: Request) {
  const supabase = createServerComponentClient({ cookies });
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const signupCode = String(formData.get('signup_code'))

  // Validate the signup code
  const validCode = await isValidSignupCode(signupCode, supabase);
  if (!validCode) {
    return NextResponse.redirect(
      `${requestUrl.origin}/signup?error=Invalid Signup Code`,
      {
        status: 301,
      }
    )
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/api/auth/callback`,
    },
  })

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Could not authenticate user`,
      {
        status: 301,
      }
    )
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/login?message=Success! Please sign in here.`,
    {
      status: 301,
    }
  )
}
