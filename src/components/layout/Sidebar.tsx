"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  Box,
  ArrowRightLeft,
  CalendarDays,
  Wrench,
  ClipboardCheck,
  BarChart,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
  User as UserIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SidebarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    departmentId?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/sign-in");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { name: "Organization Setup", href: "/setup", icon: Settings, roles: ["ADMIN"] },
    { name: "Assets", href: "/assets", icon: Box, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { name: "Allocation & Transfer", href: "/transfers", icon: ArrowRightLeft, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"] },
    { name: "Resource Booking", href: "/bookings", icon: CalendarDays, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD", "EMPLOYEE"] },
    { name: "Maintenance", href: "/maintenance", icon: Wrench, roles: ["ADMIN", "ASSET_MANAGER"] },
    { name: "Audit", href: "/audit", icon: ClipboardCheck, roles: ["ADMIN", "ASSET_MANAGER"] },
    { name: "Reports", href: "/reports", icon: BarChart, roles: ["ADMIN", "ASSET_MANAGER", "DEPARTMENT_HEAD"] },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? "5rem" : "16rem" }}
      className="relative flex flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-xl h-full z-20"
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-50 shadow-md z-30 transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center px-4 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-500">
            <Layers className="h-5 w-5" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-semibold tracking-tight text-zinc-50 whitespace-nowrap"
              >
                AssetFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-1">
        {visibleNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2.5 transition-colors group relative",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-50"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", collapsed ? "mx-auto" : "mr-3")} />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-full bg-emerald-500 rounded-r-md"
                />
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.name}>
                {/* @ts-ignore */}
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-800 text-zinc-200 border-zinc-700">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.name}>{linkContent}</div>;
        })}
      </div>

      {/* User Profile */}
      <div className="mt-auto border-t border-zinc-800 p-3">
        <DropdownMenu>
          {/* @ts-ignore */}
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md p-2 hover:bg-zinc-800/50 transition-colors">
              <Avatar className="h-8 w-8 rounded-md border border-zinc-700">
                <AvatarFallback className="bg-zinc-800 text-zinc-300 rounded-md">
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex flex-col items-start overflow-hidden whitespace-nowrap"
                  >
                    <span className="text-sm font-medium text-zinc-200">
                      {user.name}
                    </span>
                    <span className="text-xs text-zinc-500 capitalize">
                      {user.role.replace("_", " ").toLowerCase()}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-300">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-50 cursor-pointer">
              <Bell className="mr-2 h-4 w-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
}
