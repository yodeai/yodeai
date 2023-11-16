import { Button } from "@mantine/core";

export default function LogoutButton() {
  return (
    <form action="/api/auth/sign-out" method="post">
      <Button type="submit" color="gray" size="xs" variant="light">
        Logout
      </Button>
    </form>
  )
}
