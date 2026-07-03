import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.82fr_1fr]">
        <section className="flex flex-col justify-center rounded-xl border border-border bg-card p-6 shadow-[0_14px_40px_rgba(17,29,36,0.06)]">
          <p className="text-sm font-bold text-accent">가입 승인 안내</p>
          <h1 className="mt-3 font-display text-3xl leading-tight">
            실명 확인 후
            <br />
            사용 권한을 열어드립니다.
          </h1>
          <p className="mt-4 leading-7 text-muted">
            HUDTyping은 현재 승인제로 운영합니다. 가입할 때 성명은 실제 이름으로
            입력해주세요. 관리자가 가입자를 확인한 뒤 앱 사용 권한과 API 키 발급
            권한을 승인합니다.
          </p>

          <div className="mt-6 grid gap-3">
            <InfoRow title="성명" body="실명 입력이 필요합니다. 관리자가 가입자를 확인하는 기준입니다." />
            <InfoRow title="이메일" body="로그인과 안내 수신에 사용됩니다." />
            <InfoRow title="승인 요청" body="빠른 승인이 필요하면 카카오톡 papawheels로 연락해주세요." />
          </div>

          <Link
            href="/help"
            className="mt-6 text-sm font-bold text-accent transition hover:text-accent-hover"
          >
            사용 가이드 먼저 보기
          </Link>
        </section>

        <section className="flex items-center justify-center">
          <SignUp
            forceRedirectUrl="/pending"
            signInUrl="/sign-in"
            appearance={{
              elements: {
                cardBox: "shadow-none",
                card: "border border-border shadow-[0_14px_40px_rgba(17,29,36,0.08)]",
                formButtonPrimary: "bg-accent hover:bg-accent-hover",
              },
            }}
          />
        </section>
      </div>
    </main>
  );
}

function InfoRow({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted-bg/55 p-4">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
