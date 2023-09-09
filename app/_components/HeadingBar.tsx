import Link from "next/link";
import 'app/globals.css';

export default function HeadingBar(){
    return(
        <nav>
        <ul className="flex gap-2 ">
            <li>
                <Link href="/" 
                     className="text-sky-600  hover:underline">
                      <img src="/yodeai.png" style={{ paddingLeft: '20px' }} alt="Clickable image" width={55} height={55} />
                </Link>
            </li>
            <li className="ml-auto">
                 
                <Link  href="/reviews" 
                        className="text-sky-600 hover:underline" >
                      Setting
                </Link>
            </li>

        </ul>
        </nav>
    );
}