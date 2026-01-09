import React from "react";
import { useForm } from "react-hook-form";
import { User, Lock } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

import { BASE_URL } from "../constants";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// --- Minimal Login Component for Router Testing ---
const Login = () => {
  const navigate = useNavigate();

  // Initialize form with react-hook-form
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const form = new URLSearchParams();
      form.append("username", values.username);
      form.append("password", values.password);

      const response = await axios.post("/login", form, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        withCredentials: true,
      });

      // Save email and userId from server response
      // Backend returns 'username' which is actually the email
      if (response.data && response.data.username) {
        localStorage.setItem("email", response.data.username);
      }
      if (response.data && response.data.userId) {
        localStorage.setItem("userId", response.data.userId);
      }

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Login</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              rules={{ required: "Please enter your username" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Username"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              rules={{ required: "Please enter your Password!" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Password"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: "black" }}
              >
                Log in
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Or{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign Up
                </Link>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;
