
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
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
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase/client";

const initialState = {
  message: "",
};

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
      {...props}
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.06,4.71c1.032-1.76,2.56-3.25,4.306-4.257V12.03C12.953,13.16,9.25,14,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238c-2.008,1.32-4.402,2.108-7.219,2.108c-5.22,0-9.651-3.344-11.303-7.962H6.306c2.953,6.638,9.706,11.237,17.694,11.237z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.02,35.622,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

function SubmitButton({text}: {text: string}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : text}
    </Button>
  );
}

export default function AuthForm() {
  const { toast } = useToast();
  const [signInState, signInAction] = useActionState(onSignIn, initialState);
  const [signUpState, signUpAction] = useActionState(onSignUp, initialState);
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    if (signInState.message) {
      toast({
        variant: "destructive",
        title: "Sign In Failed",
        description: signInState.message,
      });
    }
  }, [signInState, toast]);

  useEffect(() => {
    if (signUpState.message) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: signUpState.message,
      });
    }
  }, [signUpState, toast]);

  const onSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/popup-closed-by-user') {
        console.log("Google sign-in cancelled by user.");
        return;
      }
      console.error("Google sign in error", error);
      toast({
        variant: "destructive",
        title: "Google Sign In Failed",
        description: "Could not sign in with Google. Please try again.",
      });
    }
  };
  
  const AuthContent = () => (
    <>
      <div className="grid gap-2" suppressHydrationWarning>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="m@example.com"
          required
        />
      </div>
      <div className="grid gap-2" suppressHydrationWarning>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" name="password" required />
      </div>
    </>
  );


  return (
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
          {isSigningUp 
            ? "Create an account to get started."
            : "Sign in to your account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button variant="outline" type="button" onClick={onSignInWithGoogle} className="w-full">
          <GoogleIcon className="mr-2 h-4 w-4" />
          Sign in with Google
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        {isSigningUp ? (
          <form action={signUpAction} className="space-y-4">
            <AuthContent />
            <SubmitButton text="Create Account" />
          </form>
        ) : (
          <form action={signInAction} className="space-y-4">
            <AuthContent />
            <SubmitButton text="Sign In" />
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
         <Separator className="my-2"/>
        <p className="text-sm text-muted-foreground">
          {isSigningUp ? "Already have an account?" : "Don't have an account?"}
          <Button variant="link" type="button" onClick={() => setIsSigningUp(!isSigningUp)} className="text-primary">
            {isSigningUp ? "Sign In" : "Sign Up"}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}
