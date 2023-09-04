import { notOk, ok } from "@lib/ok";
import prisma from "@/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await request.json();

  try {
    await prisma.block.update({
      where: { id: Number(params.id) },
      data: {
        links: {
          connect: {
            id: Number(id),
          },
        },
      },
    });
    return ok();
  } catch (err) {
    console.log(err);
    return notOk("Internal Server Error");
  }
}