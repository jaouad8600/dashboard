export const dynamic = "force-dynamic";
export const revalidate = 0;
import { getIndicatie, updateIndicatie } from "../../_indicaties";
export async function GET(_: Request, ctx: { params: { id: string }}) {
  return getIndicatie(ctx.params.id);
}
export async function PUT(req: Request, ctx: { params: { id: string }}) {
  return updateIndicatie(req, ctx.params.id);
}
