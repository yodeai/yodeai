"use client"
import Link from 'next/link'
import Messages from '@lib/messages'
import { Button, Flex, PasswordInput, Text, TextInput } from '@mantine/core'
import { IconAt } from '@tabler/icons-react';
import { useEffect } from 'react';

export default function Login() {
  useEffect(() => {

    const clearCookies = async() => {
      // Get rid of any cookies set
      const setCookieResponse = await fetch(`/api/google/signOut`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    
      if (setCookieResponse.ok) {
        console.log("Google Account Removed!");
      } else {
        console.error("Failed to remove Google cookie.");
      }
    }
    clearCookies();

  })

  return (
    <Flex mt={100} style={{ width: '100%' }} align="center" justify="center" direction={"column"}>
      <Text fw={600} size='lg'>Login to your account</Text>
      <Flex align={"center"} justify={"center"} direction={"column"}>
        <form
          className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
          action="/api/auth/sign-in"
          method="post"
        >
          <TextInput
            miw={300}
            leftSectionPointerEvents="none"
            rightSection={<IconAt size={17} />}
            name="email"
            label="Email"
            placeholder="Your email"
            required
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            type="password"
            name="password"
            required
          />

          <Button
            className="bg-green-700 rounded px-4 py-2 text-white mb-2"
            type="submit"
            variant="gradient"
            gradient={{ from: 'blue', to: 'indigo', deg: 116 }}
          >
            Sign In
          </Button>
          <Messages />
        </form>
        <Link style={{ textDecoration: "none" }} href="/signup">
          <Text
            fw={500}
            size='sm'
            variant="gradient"
            gradient={{ from: 'blue', to: 'indigo', deg: 116 }}
          >
            Don't have an account? Sign up
          </Text>
        </Link>
      </Flex>
    </Flex>
  )
}
