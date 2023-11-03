'use client';

import { useEffect, useState } from "react";
import {LinkIcon} from '@heroicons/react/20/solid'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Lens } from "app/_types/lens";

export default function PublishLensButton({ lensId }) {
    const [published, setPublished] = useState(false);
    const supabase = createClientComponentClient()
    const [clicked, setClicked] = useState(false);
    useEffect(() => {
        const checkPublishedLens = async() => {
            const { data: lens, error } = await supabase
            .from('lens')
            .select()
            .eq('lens_id', lensId);
            if (error) {
                console.log("error", error.message)
            } else {
                setPublished(lens[0].public)
            }
        } 
        checkPublishedLens();
    }, [])

    const handleClick = async() => {
        if (published) {
            if (window.confirm("Are you sure you want to unpublish this lens?")) {
                const { data: lens, error } = await supabase
                .from('lens')
                .update({'public': false})
                .eq('lens_id', lensId);
                if (error) {
                    console.log("error", error.message)
                } else {
                    setPublished(false)
                }
            }
        } else {
            const { data: lens, error } = await supabase
            .from('lens')
            .update({'public': true})
            .eq('lens_id', lensId);
            if (error) {
                console.log("error", error.message)
            } else {
                setPublished(true)
            }
        }
    };

    const handleGetLink = () => {
        const mainLink = window.location.href;
        const viewLink = mainLink.replace(/lens/g, "viewlens");
        navigator.clipboard.writeText(viewLink)
        setClicked(true)
        setTimeout(() => setClicked(false), 1500)
    }


    return(

    );
}