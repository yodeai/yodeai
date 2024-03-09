import Link from "next/link";
import UserAccountHandler from './UserAccount';
import { Image } from "@mantine/core";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";


export default async function HeadingBar() {
    const supabaseClient = createServerComponentClient({ cookies });
    const user = await supabaseClient.auth.getUser();

    return (
        <nav className="flex justify-between items-center w-full bg-white p-[12px] h-[60px] border-b border-b-[#eeeeee]">
            <Link href="/" >
                <Image src="/yodeai.png" ml={4} h={{ base: "75%", sm: 36 }} alt="yodeai logo" />
            </Link>

            <UserAccountHandler user={user?.data?.user} />
        </nav>
    );
}
