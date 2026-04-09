// src/components/ui/Badge.tsx
interface BadgeProps {
  variant: "success" | "danger" | "warning" | "info";
  children: React.ReactNode;
}

const variants = {
  success: "bg-green-100 text-green-800",
  danger: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  info: "bg-blue-100 text-blue-800",
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${variants[variant]}`}>
      {children}
    </span>
  );
}
