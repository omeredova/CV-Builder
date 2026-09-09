export interface AuthFormMessageProps {
  className?: string;
  id?: string;
  message?: string;
}

export function AuthFormMessage({
  className = "mt-field-message-top",
  id,
  message,
}: AuthFormMessageProps) {
  return message ? (
    <p className={`${className} text-center text-xs text-primary`} id={id} role="alert">
      {message}
    </p>
  ) : null;
}
