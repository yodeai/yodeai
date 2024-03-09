'use client';

import { useState } from "react";
import { FaLink } from '@react-icons/all-files/fa/FaLink'

export default function ShareLinkButton() {
    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        const mainLink = window.location.href;
        const viewLink = mainLink.replace(/lens/g, "viewlens");
        navigator.clipboard.writeText(viewLink)
        setClicked(true)
        setTimeout(() => setClicked(false), 1500)
    };

    return (
        <button onClick={handleClick}
            className="border flex gap-1 items-center px-2 py-1 rounded test-sm text-slate-500 hover:bg-sky-200 hover:text-slate-700">
            <FaLink className="h-4 w-4" />
            {clicked ? 'Link copied' : 'Share'}
        </button>
    );
}