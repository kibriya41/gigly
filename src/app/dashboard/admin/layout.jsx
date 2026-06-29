"use client";

import React from "react";
import RoleGuard from "@/components/dashboard/RoleGuard";

/**
 * Admin layout — authorizes every admin route in one place.
 *
 * Wraps all pages under /dashboard/admin/* with a RoleGuard that only permits
 * the "admin" role. The dashboard layout (parent) already renders the shared
 * sidebar, which shows the admin-specific menu for admin users. This layout
 * adds the authorization layer: unauthorized visitors (not signed in, or
 * signed in as client/freelancer) see a clean "Access Denied" screen instead
 * of the admin content.
 *
 * Note: the Edge middleware is the primary guard (it redirects wrong-role
 * traffic before the page even loads). This RoleGuard is a second line of
 * defense for the brief session-loading window and any cookie drift.
 */
export default function AdminLayout({ children }) {
  return <RoleGuard allowedRoles={["admin"]}>{children}</RoleGuard>;
}
