import { Button } from "@mantine/core";

export default function LogoutButton() {
  return (
    <form action="/api/auth/sign-out" method="post">
      <Button type="submit" unstyled className="bg-transparent p-0 m-0">
        Logout
      </Button>
    </form>
  )
}
