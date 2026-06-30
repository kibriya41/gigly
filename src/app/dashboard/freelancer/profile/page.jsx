"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { getUserByEmail, updateUserProfile } from "@/lib/actions/users";
import {
  Loader2,
  User,
  Image as ImageIcon,
  Tag,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus
} from "lucide-react";

const SUGGESTED_SKILLS = [
  "React", "Next.js", "TypeScript", "Figma", "UI/UX", "Node.js",
  "Python", "SEO", "Content Writing", "Logo Design", "Branding",
  "Social Media", "WordPress", "Shopify", "Illustration", "3D Modeling"
];

export default function FreelancerProfilePage() {
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bio, setBio] = useState("");
  const [hirePrice, setHirePrice] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const skillInputRef = useRef(null);

  useEffect(() => {
    if (sessionStatus === "loading") return;
    let isMounted = true;

    const fetchProfile = async () => {
      if (!session?.user?.email) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const res = await getUserByEmail(session.user.email);
        if (!isMounted) return;
        if (res.success && res.data) {
          const u = res.data;
          setProfile(u);
          setName(u.name || "");
          setImageUrl(u.image || "");
          setBio(u.bio || "");
          setHirePrice(u.hirePrice ? u.hirePrice.toString() : "");
          setSkills(u.skills || []);
        } else {
          setName(session.user.name || "");
          setImageUrl(session.user.image || "");
        }
      } catch (err) {
        if (isMounted) console.error("Failed to load profile", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [session, sessionStatus]);

  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    if (skills.length >= 15) {
      setFormErrors(prev => ({ ...prev, skills: "Max 15 skills allowed" }));
      return;
    }
    setSkills(prev => [...prev, trimmed]);
    setSkillInput("");
    setFormErrors(prev => ({ ...prev, skills: "" }));
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Full name is required";
    if (!imageUrl.trim()) errors.image = "Profile photo link is required";
    if (!bio.trim() || bio.length < 30) errors.bio = "Bio must be at least 30 characters";
    if (!hirePrice || Number(hirePrice) <= 0) errors.hirePrice = "Hourly rate must be greater than 0";
    if (skills.length === 0) errors.skills = "At least one skill tag is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUpdating(true);
    setSuccess(false);
    setError(null);

    const payload = {
      name: name.trim(),
      image: imageUrl.trim(),
      bio: bio.trim(),
      hirePrice: parseFloat(hirePrice),
      skills
    };

    try {
      const res = await updateUserProfile(session.user.email, payload);
      if (res.success) {
        setSuccess(true);
        // Attempt to update local auth session if BetterAuth supports it
        if (updateSession) {
          await updateSession();
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.message || "Failed to save profile changes.");
      }
    } catch (err) {
      setError("An error occurred during submission.");
    } finally {
      setUpdating(false);
    }
  };

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2a9d8f]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-white dark:bg-[#131c2b] p-8 rounded-3xl border border-[#d4ebe6] dark:border-[#1e293b]/50 shadow-md space-y-6 max-w-sm w-full">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-2xl font-serif font-bold text-[#1a3c34] dark:text-[#e8f4f0]">Access Denied</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif font-semibold text-[#1a3c34] dark:text-[#e8f4f0] tracking-tight">Edit Profile</h1>
        <p className="text-[#5a7a72] dark:text-[#9fb3c8] mt-1.5 text-[15px]">Customize your freelancer profile details and hourly pricing.</p>
      </div>

      {/* Profile Form */}
      <div className="bg-white dark:bg-[#131c2b] border border-[#d4ebe6] dark:border-[#1e293b]/40 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Status Alerts */}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-semibold animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              Changes saved successfully! Your profile has been updated.
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-2 text-sm font-semibold animate-in fade-in duration-200">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#5a7a72] dark:text-[#9fb3c8] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#2a9d8f]" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all
                ${formErrors.name ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#2a9d8f]"}`}
              placeholder="e.g. Alex Mercer"
            />
            {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
          </div>

          {/* Profile Photo Link */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#5a7a72] dark:text-[#9fb3c8] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#2a9d8f]" />
              Profile Photo URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all
                ${formErrors.image ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#2a9d8f]"}`}
              placeholder="https://example.com/photo.jpg"
            />
            {formErrors.image && <p className="text-xs text-red-500">{formErrors.image}</p>}
          </div>

          {/* Hourly Rate */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#5a7a72] dark:text-[#9fb3c8] uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#2a9d8f]" />
              Hourly Rate (USD / hr) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-sm font-semibold text-[#8aa89e] dark:text-[#6b7e94]">$</span>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={hirePrice}
                onChange={(e) => setHirePrice(e.target.value)}
                className={`w-full pl-8 pr-4 py-3 border rounded-xl text-sm outline-none transition-all
                  ${formErrors.hirePrice ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#2a9d8f]"}`}
                placeholder="45.00"
              />
            </div>
            {formErrors.hirePrice && <p className="text-xs text-red-500">{formErrors.hirePrice}</p>}
          </div>

          {/* Skills Editor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#5a7a72] dark:text-[#9fb3c8] uppercase tracking-wider flex items-center gap-1.5 justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#2a9d8f]" />
                Skills Tags <span className="text-red-500">*</span>
              </span>
              <span className="text-[10px] text-[#8aa89e] dark:text-[#6b7e94] normal-case">{skills.length}/15 skills</span>
            </label>
            <div className="border border-gray-200 focus-within:border-[#2a9d8f] focus-within:ring-2 focus-within:ring-[#2a9d8f]/10 rounded-xl p-2.5 bg-white dark:bg-[#131c2b] transition-all">
              <div className="flex flex-wrap gap-1.5 items-center">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#eaf5f2] dark:bg-[#1a2435] text-[#2a9d8f] border border-[#d4ebe6] dark:border-[#1e293b]/50"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:bg-white dark:bg-[#131c2b]/50 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  ref={skillInputRef}
                  type="text"
                  placeholder={skills.length === 0 ? "Press Enter to add skills..." : "Add..."}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleAddSkill(skillInput);
                    }
                  }}
                  className="flex-1 min-w-[100px] px-1 py-0.5 outline-none text-sm"
                  disabled={skills.length >= 15}
                />
              </div>
            </div>
            {formErrors.skills && <p className="text-xs text-red-500">{formErrors.skills}</p>}

            {/* Popular Skill suggestions */}
            <div className="flex flex-wrap gap-1 pt-1">
              {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).slice(0, 7).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSkill(skill)}
                  className="text-[10px] bg-gray-50 hover:bg-[#eaf5f2] dark:bg-[#1a2435] text-[#5a7a72] dark:text-[#9fb3c8] px-2 py-1 rounded-lg border border-gray-100 transition-colors"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#5a7a72] dark:text-[#9fb3c8] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#2a9d8f]" />
              Bio Text <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all resize-y leading-relaxed text-[#5a7a72] dark:text-[#9fb3c8]
                ${formErrors.bio ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#2a9d8f]"}`}
              placeholder="Describe your freelance qualifications, background, past experience, and expertise..."
            />
            <div className="flex justify-between text-[10px] text-[#8aa89e] dark:text-[#6b7e94] px-1 mt-0.5">
              <span>Must be at least 30 characters.</span>
              <span className="font-semibold">{bio.length} chars</span>
            </div>
            {formErrors.bio && <p className="text-xs text-red-500">{formErrors.bio}</p>}
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-3.5 bg-[#1a3c34] hover:bg-[#255248] disabled:bg-gray-300 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
