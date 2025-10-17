export const dynamic = "force-dynamic";
export const revalidate = 0;
import { listEvaluaties, createEvaluatie } from "../../../_indicaties";
export async function GET(_: Request, ctx: { params: { id: string }}) {
  return listEvaluaties(ctx.params.id);
}
export async function POST(req: Request, ctx: { params: { id: string }}) {
  return createEvaluatie(req, ctx.params.id);
}
