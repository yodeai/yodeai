import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

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

async function addToOnboardingList(uid, supabase) {
  const { error } = await supabase
    .from('onboarding_list')
    .insert([{ uid: uid }]);

  if (error) {
    console.error('Error adding to onboarding list:', error);
    throw new Error('Failed to add to onboarding list');
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/api/auth/callback`,
    },
  })

  // console.log("Hello there");
  // console.log(data);

  // if (data && data.user) {
  //   // Sign the user in
  //   const { error: signInError } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   });
  
  //   if (signInError) {
  //     console.error('Could not sign in user automatically after signup:', signInError);
  //     // Handle error or redirect accordingly
  //     return NextResponse.redirect(`${requestUrl.origin}/login?error=Could not automatically sign in user`, { status: 301 });
  //   }
  
  // }

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=Could not authenticate user`,
      {
        status: 301,
      }
    )
  }

  try {
    await addToOnboardingList(data.user.id, supabase);
    console.error('Signup succeeded, and added user to onboarding list');
  } catch (error) {
    console.error('Signup succeeded, but failed to add to onboarding list:', error);
  }

  return NextResponse.redirect(
    requestUrl.origin,
    {
      status: 301,
    }
  )
}
