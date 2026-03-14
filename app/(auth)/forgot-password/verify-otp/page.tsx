import VerifyOtpForm from "./VerifyOtpForm";

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F5F9] px-4 py-12">
      <div className="flex w-full justify-center">
        <VerifyOtpForm email={email ?? null} />
      </div>
    </div>
  );
}
