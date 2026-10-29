import { BackButton } from "@/components/navigation/back-button";

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BackButton />
      {children}
    </>
  );
}
