import { BackButton } from "@/components/navigation/back-button";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackButton />
      {children}
    </>
  );
}
