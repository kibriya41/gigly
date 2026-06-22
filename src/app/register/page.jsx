"use client";

import { useState, useCallback } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Circle,
  Code2,
  Wrench,
  FileText,
  DollarSign,
  ImageIcon,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button, Card, Chip, FieldError, Input, Label, ProgressBar, TextArea, TextField } from "@heroui/react";

const RegisterPage = () => {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photoUrl: "",
    role: "freelancer",
    skills: "",
    hirePrice: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const isFreelancer = formData.role === "freelancer";

  const analyzePassword = useCallback((value) => {
    const checks = {
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    };
    setPasswordChecks(checks);
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength * 20);
  }, []);

  const handleChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (name === "password") {
      analyzePassword(value);
    }
  }, [errors, analyzePassword]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.photoUrl.trim()) newErrors.photoUrl = "Photo URL is required";


    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Must contain an uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Must contain a lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Must contain a number";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password = "Must contain a special character";
    }

    if (isFreelancer) {
      if (!formData.skills.trim()) newErrors.skills = "Skills are required for freelancers";
      if (!formData.hirePrice.trim()) {
        newErrors.hirePrice = "Hourly rate is required";
      } else if (isNaN(parseFloat(formData.hirePrice)) || parseFloat(formData.hirePrice) <= 0) {
        newErrors.hirePrice = "Please enter a valid hourly rate";
      }
      if (!formData.bio.trim()) {
        newErrors.bio = "Bio is required for freelancers";
      } else if (formData.bio.trim().length < 50) {
        newErrors.bio = "Bio must be at least 50 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isFreelancer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      image: formData.photoUrl,
      callbackURL: "/dashboard",
    };

    if (isFreelancer) {
      payload.skills = formData.skills.split(",").map(s => s.trim()).filter(Boolean);
      payload.hirePrice = parseFloat(formData.hirePrice);
      payload.bio = formData.bio;
    }

    try {
      await authClient.signUp.email(payload, {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          setLoading(false);
          toast.success("Welcome to SkillSwap! Your account is ready.");
          router.push("/dashboard");
          router.refresh();
        },
        onError: (ctx) => {
          setLoading(false);
          const message = ctx.error?.message || "Registration failed";
          toast.error(message);
          setErrors((prev) => ({ ...prev, server: message }));
        },
      });
    } catch (error) {
      setLoading(false);
      toast.error("An unexpected error occurred");
      console.error("Registration error:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social(
        { provider: "google", callbackURL: "/dashboard" },
        {
          onRequest: () => setLoading(true),
          onSuccess: () => {
            setLoading(false);
            toast.success("Google login successful!");
            router.push("/dashboard");
            router.refresh();
          },
          onError: (ctx) => {
            setLoading(false);
            toast.error(ctx.error?.message || "Google login failed");
            setErrors((prev) => ({ ...prev, server: ctx.error?.message }));
          },
        }
      );
    } catch (error) {
      setLoading(false);
      toast.error("An unexpected error occurred");
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "default";
    if (passwordStrength <= 20) return "danger";
    if (passwordStrength <= 40) return "warning";
    if (passwordStrength <= 60) return "primary";
    if (passwordStrength <= 80) return "secondary";
    return "success";
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "Enter password";
    if (passwordStrength <= 20) return "Very Weak";
    if (passwordStrength <= 40) return "Weak";
    if (passwordStrength <= 60) return "Fair";
    if (passwordStrength <= 80) return "Good";
    return "Strong";
  };

  const passwordRequirements = [
    { label: "At least 8 characters", valid: passwordChecks.length },
    { label: "One uppercase letter (A-Z)", valid: passwordChecks.uppercase },
    { label: "One lowercase letter (a-z)", valid: passwordChecks.lowercase },
    { label: "One number (0-9)", valid: passwordChecks.number },
    { label: "One special character (!@#$...)", valid: passwordChecks.special },
  ];

  const roleOptions = [
    { value: "client", label: "Client", description: "Hire talent", icon: User },
    { value: "freelancer", label: "Freelancer", description: "Find work", icon: Code2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f6] via-[#f8fcfb] to-[#eaf5f2] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2a9d8f] shadow-lg shadow-[#2a9d8f]/20 mb-4">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#1a3c34]">SkillSwap</h1>
          <p className="text-[#5a7a72] mt-1 text-sm">Freelance Micro-Task Marketplace</p>
        </div>

        <Card className="border border-[#d4ebe6] shadow-xl shadow-[#2a9d8f]/5 bg-white/80 backdrop-blur-sm">
          <div className="p-6 md:p-8 space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1a3c34]">Create Account</h2>
              <p className="text-[#6b8a82] text-sm mt-1">Join thousands of freelancers and clients</p>
            </div>

            {errors.server && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {errors.server}
              </div>
            )}

            {/* Google Login */}
            <Button
              type="button"
              variant="bordered"
              onPress={handleGoogleLogin}
              isLoading={loading}
              className="w-full rounded-xl py-3 border-2 border-[#d4ebe6] text-[#1a3c34] font-medium hover:bg-[#f0f9f6]"
            >
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#d4ebe6]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-[#8aa89e] text-xs font-medium">
                  or register with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((option) => {
                  const isSelected = formData.role === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChange("role", option.value)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? option.value === "freelancer"
                            ? "border-[#2a9d8f] bg-[#eaf5f2] shadow-md shadow-[#2a9d8f]/10"
                            : "border-orange-400 bg-orange-50 shadow-md shadow-orange-200"
                          : "border-[#d4ebe6] bg-white hover:border-[#2a9d8f]/50"
                      }`}
                    >
                      {isSelected && (
                        <div className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white ${
                          option.value === "freelancer" ? "bg-[#2a9d8f]" : "bg-orange-400"
                        }`} />
                      )}
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? option.value === "freelancer" ? "bg-[#2a9d8f] text-white" : "bg-orange-400 text-white"
                          : "bg-[#f0f9f6] text-[#8aa89e]"
                      }`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className={`font-semibold text-sm ${isSelected ? (option.value === "freelancer" ? "text-[#2a9d8f]" : "text-orange-500") : "text-[#1a3c34]"}`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-[#6b8a82]">{option.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Name */}
              <TextField name="name" isRequired value={formData.name} onChange={(v) => handleChange("name", v)} isInvalid={!!errors.name} errorMessage={errors.name}>
                <Label>Full Name</Label>
                <Input placeholder="John Doe" aria-label="Full Name" />
                <FieldError />
              </TextField>

              {/* Email */}
              <TextField name="email" isRequired value={formData.email} onChange={(v) => handleChange("email", v)} isInvalid={!!errors.email} errorMessage={errors.email}>
                <Label>Email Address</Label>
                <Input type="email" placeholder="john@example.com" aria-label="Email Address" />
                <FieldError />
              </TextField>

              {/* Photo URL */}
              <TextField name="photoUrl" isRequired value={formData.photoUrl} onChange={(v) => handleChange("photoUrl", v)} isInvalid={!!errors.photoUrl} errorMessage={errors.photoUrl}>
                <Label className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#2a9d8f]" />
                  Photo URL
                </Label>
                <Input placeholder="https://example.com/photo.jpg" aria-label="Photo URL" />
                <FieldError />
              </TextField>

              {/* Photo Preview */}
              {formData.photoUrl && (
                <div className="flex justify-center">
                  <div className="relative w-16 h-16">
                    <Image
                      src={formData.photoUrl}
                      alt="Profile preview"
                      fill
                      className="rounded-full object-cover border-2 border-[#2a9d8f]/20"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <TextField name="password" isRequired value={formData.password} onChange={(v) => handleChange("password", v)} isInvalid={!!errors.password} errorMessage={errors.password}>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FieldError />
              </TextField>

              {/* Password Strength */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Password strength</span>
                  <Chip color={getStrengthColor()} variant="flat" size="sm">{getStrengthLabel()}</Chip>
                </div>
                <ProgressBar value={passwordStrength} color={getStrengthColor()} />
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {passwordRequirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {req.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-300" />
                      )}
                      <span className={req.valid ? "text-green-600" : "text-gray-500"}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Freelancer Fields */}
              {isFreelancer && (
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-sm font-semibold text-[#2a9d8f] flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> Freelancer Profile
                  </p>

                  <TextField name="skills" isRequired value={formData.skills} onChange={(v) => handleChange("skills", v)} isInvalid={!!errors.skills} errorMessage={errors.skills}>
                    <Label>Skills (comma separated)</Label>
                    <Input placeholder="React, Node.js, Figma" aria-label="Skills (comma separated)" />
                    <FieldError />
                  </TextField>

                  <TextField name="bio" isRequired value={formData.bio} onChange={(v) => handleChange("bio", v)} isInvalid={!!errors.bio} errorMessage={errors.bio}>
                    <Label>Bio</Label>
                    <TextArea
                      placeholder="Tell clients about your experience..."
                      aria-label="Bio"
                      className="min-h-[100px]"
                    />
                    <FieldError />
                  </TextField>

                  <TextField name="hirePrice" isRequired value={formData.hirePrice} onChange={(v) => handleChange("hirePrice", v)} isInvalid={!!errors.hirePrice} errorMessage={errors.hirePrice}>
                    <Label>Hourly Rate (USD)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="50"
                        aria-label="Hourly Rate in USD"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    </div>
                    <FieldError />
                  </TextField>
                </div>
              )}

              <Button
                type="submit"
                isLoading={loading}
                className="w-full bg-[#2a9d8f] hover:bg-[#238b7e] text-white py-3 rounded-xl font-semibold"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <ArrowRight className="ml-2" />
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-[#2a9d8f] font-medium">Sign in here</Link>
              </p>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;