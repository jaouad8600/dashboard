import { clsx } from "clsx";
export function Card({className,...p}:{className?:string}&React.HTMLAttributes<HTMLDivElement>){
  return <div className={clsx("card", className)} {...p} />;
}
export function CardHeader({className,...p}:{className?:string}&React.HTMLAttributes<HTMLDivElement>){
  return <div className={clsx("px-4 pt-4 pb-2 font-semibold",className)} {...p} />;
}
export function CardContent({className,...p}:{className?:string}&React.HTMLAttributes<HTMLDivElement>){
  return <div className={clsx("px-4 pb-4",className)} {...p} />;
}
