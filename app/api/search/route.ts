import { notOk, ok } from "@lib/ok";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return notOk("Missing query parameter", 422);
  }

  try {
    const blocks = await prisma.block.findMany({
      where: {
        text: {
          search: query,
        },
      },
    });

    return ok(blocks);
  } catch (error) {
    return notOk("Something went wrong.", 500);
  }
}