import Image from "next/image";

import { formatName } from "@/shared/lib/formatters";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

export interface EmployeeAvatarProps {
  avatar: string | null;
  firstName: string | null;
  email: string;
  size?: "profile" | "table";
}

export function EmployeeAvatar({ avatar, firstName, email, size = "table" }: EmployeeAvatarProps) {
  const normalizedFirstName = firstName?.trim();
  const displayName = normalizedFirstName || email;
  const initial = formatName(displayName);

  return (
    <Avatar
      aria-label={`${displayName} avatar`}
      className={
        size === "profile"
          ? "size-profile-avatar bg-employee-avatar [font-size:var(--text-profile-avatar)] text-employee-avatar-foreground"
          : "size-10 bg-employee-avatar text-xl text-employee-avatar-foreground"
      }
      role="img"
    >
      {avatar ? (
        <Image
          alt=""
          className="size-full object-cover"
          height={size === "profile" ? 120 : 40}
          src={avatar}
          width={size === "profile" ? 120 : 40}
        />
      ) : (
        <AvatarFallback>{initial}</AvatarFallback>
      )}
    </Avatar>
  );
}
