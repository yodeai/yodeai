import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { company_name: string } }) {
  try {
    const response = await fetch(`https://company.clearbit.com/v1/domains/find?name=${params.company_name}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLEARBIT_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error("Clearbit API request failed:", response.statusText);
      return new NextResponse(
        JSON.stringify({ error: "Failed to fetch company information" }),
        { status: response.status }
      );
    }

    const data = await response.json();

    return new NextResponse(JSON.stringify({ domain: data?.domain }), { status: 200 });
  } catch (err) {
    console.error("Error in fetching company information:", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch company information" }),
      { status: 500 }
    );
  }
}
