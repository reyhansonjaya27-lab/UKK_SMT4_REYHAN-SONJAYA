"use client";
import Image from "next/image";
import { MenuLandingPage } from "./component/landing-page-menu/page";
import { Button } from "@/components/ui/button";
import { LandingPageHero } from "./component/landing-page-hero/page";
import { SearchIcon, X } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Login gagal.";
        throw new Error(message);
      }

      setIsLoginOpen(false);
      router.push("/admin");
      router.refresh();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login gagal.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <main className="relative relative w-full bg-white dark:bg-pink-950">
      <div className="relative z-0 -mt-[96px]">
        <LandingPageHero />
      </div>
      <div className="absolute top-0 left-0 z-10 w-full flex justify-center">
        <div className="w-[95%] h-[80px] bg-pink-900 dark:bg-pink-950 rounded-[70px] flex mt-4 mx-8 p-4">
          {/* logo */}
          <div className="relative w-[200px] h-[50px] rounded-[70px] items-center justify-start">
            <Image
              className="p-[1px]"
              src="/img/smk_mvp_ars_logo_white.png"
              alt="logo"
              fill
            />
          </div>
          {/* menu */}
          <div className="flex flex-1 items-center justify-center">
            <MenuLandingPage />
          </div>
          {/* login */}
          <div className="flex items-center justify-end p-4">
            <Button
              onClick={() => setIsLoginOpen(true)}
              className="rounded-full border border-pink-100 bg-white p-[20px] text-[16px] font-semibold text-pink-900 hover:bg-pink-50 dark:border-pink-800 dark:bg-pink-900 dark:text-pink-50"
              size="lg"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[500px] rounded-xl bg-white p-6 shadow-2xl dark:bg-pink-950">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Tutup form login"
              onClick={() => setIsLoginOpen(false)}
              className="absolute right-3 top-3"
            >
              <X />
            </Button>
            <form onSubmit={handleLogin}>
              <Field className="w-full space-y-4 pt-2">
                <FieldLabel htmlFor="email-input">Email</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="email-input"
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                  <InputGroupAddon align="inline-start">
                    <SearchIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
                <FieldLabel htmlFor="password-input">Password</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="password-input"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <InputGroupAddon align="inline-start">
                    <SearchIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
                {loginError && <p role="alert" className="text-sm text-destructive">{loginError}</p>}
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Memproses..." : "Login"}
                </Button>
              </Field>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
