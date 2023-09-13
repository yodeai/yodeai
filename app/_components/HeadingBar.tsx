import Link from "next/link";
import 'app/globals.css';
import UserAccountHandler from './UserAccount';

export default function HeadingBar() {
    return (
        <nav className="border-b px-4">
            <ul className="flex gap-2  ">
                <li>
                    <Link href="/">
                        <img src="/yodeai.png" className="pl-5 mt-1" alt="yodeai logo" width={65} height={65} />
                    </Link>

                </li>
                <li className="ml-auto">

                    <UserAccountHandler />

                </li>

            </ul>
        </nav>
    );
}