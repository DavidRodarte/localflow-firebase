"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { onSignIn, onSignUp } from "@/app/auth/actions";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  message: "",
};

function SubmitButton({
  signInText,
  signUpText,
}: {
  signInText: string;
  signUpText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <Button type="submit" className="w-full" disabled={pending} name="intent" value="signup">
        {pending ? <Loader2 className="animate-spin" /> : signUpText}
      </Button>
      <Button type="submit" variant="secondary" className="w-full" disabled={pending} name="intent" value="signin">
        {pending ? <Loader2 className="animate-spin" /> : signInText}
      </Button>
    </>
  );
}

export default function AuthForm() {
  const { toast } = useToast();
  const [signInState, signInAction] = useFormState(onSignIn, initialState);
  const [signUpState, signUpAction] = useFormState(onSignUp, initialState);

  useEffect(() => {
    if (signInState.message) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: signInState.message,
      });
    }
  }, [signInState]);

  useEffect(() => {
    if (signUpState.message) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: signUpState.message,
      });
    }
  }, [signUpState]);

  const formAction = async (formData: FormData) => {
    const intent = formData.get("intent");
    if (intent === "signin") {
      signInAction(formData);
    } else {
      signUpAction(formData);
    }
  };

  return (
    <form action={formAction}>
      <Card>
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="flex items-center gap-2 justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="font-headline text-2xl font-bold text-foreground">
              LocalFlow
            </span>
          </Link>
          <CardTitle className="text-2xl pt-4">Welcome</CardTitle>
          <CardDescription>
            Enter your email and password to sign in or create an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" name="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <SubmitButton signInText="Sign In" signUpText="Sign Up" />
        </CardFooter>
      </Card>
    </form>
  );
}
