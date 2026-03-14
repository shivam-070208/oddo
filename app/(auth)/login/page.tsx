
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F1F5F9] px-4 py-12">
      <div className="flex w-full justify-center">
        <LoginForm />
      </div>
    </div>
  );
}
