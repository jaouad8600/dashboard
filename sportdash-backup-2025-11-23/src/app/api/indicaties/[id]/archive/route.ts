export const dynamic = "force-dynamic";
export const revalidate = 0;
import { archiveIndicatie } from "../../../_indicaties";
export async function POST(req: Request, ctx: { params: { id: string }}) {
  return archiveIndicatie(req, ctx.params.id);
}
