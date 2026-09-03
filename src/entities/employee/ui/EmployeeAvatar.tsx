import Image from "next/image";

import { formatName } from "@/shared/lib/formatters";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";

export interface EmployeeAvatarProps {
  avatar: string | null;
  firstName: string | null;
  email: string;
}

export function EmployeeAvatar({ avatar, firstName, email }: EmployeeAvatarProps) {
  const normalizedFirstName = firstName?.trim();
  const displayName = normalizedFirstName || email;
  const initial = formatName(displayName);

  return (
    <Avatar
      aria-label={`${displayName} avatar`}
      className="size-10 bg-employee-avatar text-xl text-employee-avatar-foreground"
      role="img"
    >
      {avatar ? (
        <Image
          alt=""
          className="size-full object-cover"
          height={40}
          src={avatar}
          width={40}
        />
      ) : (
        <AvatarFallback>{initial}</AvatarFallback>
      )}
    </Avatar>
  );
}
