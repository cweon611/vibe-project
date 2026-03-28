"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthFormState } from "./types";

const EMAIL_NOT_CONFIRMED_TAG = "__EMAIL_NOT_CONFIRMED__";

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("email not confirmed") || m.includes("confirm your email"))
    return EMAIL_NOT_CONFIRMED_TAG;
  if (m.includes("invalid login credentials"))
    return "이메일 또는 비밀번호가 올바르지 않아요.";
  if (m.includes("user already registered"))
    return "이미 가입된 이메일이에요. 로그인해 주세요.";
  return message;
}

export { EMAIL_NOT_CONFIRMED_TAG };

export async function loginAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signupAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nickname = String(formData.get("nickname") ?? "").trim();

  if (!email || !password || !nickname) {
    return { error: "모든 항목을 입력해 주세요." };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 해요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname },
    },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  if (!data.session) {
    return {
      info: "이메일 인증이 필요합니다.",
      email,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
