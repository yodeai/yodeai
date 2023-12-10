import Link from "next/link";
import UserAccountHandler from './UserAccount';
import { Divider, Flex, Image } from "@mantine/core";

export default function HeadingBar() {
    return (
        <nav className="flex justify-between align-middle w-full bg-white p-[12px] h-[60px] border-b border-b-[#eeeeee]">
            <Link href="/">
                <Image src="/yodeai.png" ml={4} alt="yodeai logo" h={36} />
            </Link>

            <UserAccountHandler />
        </nav>
    );
}