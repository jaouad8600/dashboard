import { clsx } from "clsx";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
};
export function Button({ className, variant = "outline", ...props }: Props) {
  const base = "px-3 py-2 rounded-xl border text-sm transition";
  const styles =
    variant === "primary"
      ? "bg-brand-600 text-white border-brand-600 hover:bg-brand-700"
      : "border-zinc-200 hover:bg-zinc-50";
  return <button className={clsx(base, styles, className)} {...props} />;
}
