import Link from "next/link";
import 'app/globals.css';
import UserAccountHandler from './UserAccount';
import { Divider, Flex, Image } from "@mantine/core";

export default function HeadingBar() {
    return (
        <nav className="py-2 px-2">
            <Flex align={"center"}>
                <Link href="/">
                    <Image src="/yodeai.png" ml={4} alt="yodeai logo" h={36} />
                </Link>

                <UserAccountHandler />
            </Flex>
            <Divider color="gray.2" mt={6} style={{ width: '100%' }} />
        </nav>
    );
}