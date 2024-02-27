
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Spreadsheet from '@components/Spreadsheet';
import { Database, Tables } from "app/_types/supabase";
import { redirect } from "next/navigation";

import { PRDTickets } from "@components/Plugins";
import { Ticket } from "app/_types/plugins/tickets";

type PageProps = {
    params: { id: number }
    searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Page({ params, searchParams }: PageProps) {
    const { id } = params;
    const supabase = createServerComponentClient<Database>({ cookies });

    if (Number.isNaN(Number(id))) return <p>Spreadsheet not found.</p>

    const userData = await supabase.auth.getUser();
    const user = userData.data.user;
    if (!userData || !user) return redirect("/notFound");

    const data: Ticket[] = [{
        id: 1,
        title: "Ticket 1",
        description: "This is a ticket",
        status: "open",
        priority: "high",
        assignee: "user",
        reporter: "user",
        created_at: "2021-08-01",
        updated_at: "2021-08-01"
    }, {
        id: 2,
        title: "Ticket 2",
        description: "This is another ticket",
        status: "closed",
        priority: "low",
        assignee: "user",
        reporter: "user",
        created_at: "2021-08-01",
        updated_at: "2021-08-01"
    }, {
        id: 3,
        title: "Ticket 3",
        description: "This is a third ticket",
        status: "open",
        priority: "medium",
        assignee: "user",
        reporter: "user",
        created_at: "2021-08-01",
        updated_at: "2021-08-01"
    }, {
        id: 4,
        title: "Ticket 4",
        description: "This is a fourth ticket",
        status: "open",
        priority: "high",
        assignee: "user",
        reporter: "user",
        created_at: "2021-08-01",
        updated_at: "2021-08-01"
    }, {
        id: 5,
        title: "Ticket 5",
        description: "This is a fifth ticket",
        status: "closed",
        priority: "low",
        assignee: "user",
        reporter: "user",
        created_at: "2021-08-01",
        updated_at: "2021-08-01"
    
    }]

    return <PRDTickets
        tickets={data}
    />
}