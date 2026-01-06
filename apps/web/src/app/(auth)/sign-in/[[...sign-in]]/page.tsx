import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90",
          card: "shadow-xl",
        },
      }}
    />
  );
}
