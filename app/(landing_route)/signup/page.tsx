import Link from 'next/link'
import Messages from '@lib/messages'
import { Button, Flex, PasswordInput, Text, TextInput } from '@mantine/core'
import { IconAt } from '@tabler/icons-react'

export default function Signup() {
  return (
    <Flex mt={100} style={{ width: '100%' }} align="center" justify="center" direction={"column"}>
      <Text fw={600} size='lg'>Sign up for Yodeai</Text>

      <Flex align={"center"} justify={"center"} direction={"column"}>

        <form
          className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
          action="/api/auth/sign-up"
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

          <TextInput
            label="Signup Code"
            placeholder="Signup Code"
            name="signup_code"
            required
          />

          <Button
            className="bg-green-700 rounded px-4 py-2 text-white mb-2"
            type="submit"
            variant="gradient"
            gradient={{ from: 'blue', to: 'indigo', deg: 116 }}
          >
            Sign Up
          </Button>

          <Messages />
        </form>
        <Link style={{ textDecoration: "none" }} href="/login">
          <Text
            fw={500}
            size='sm'
            variant="gradient"
            gradient={{ from: 'blue', to: 'indigo', deg: 116 }}
          >
            Already have an account? Log in
          </Text>
        </Link>
      </Flex>
    </Flex>
  )
}
