import { type ReactNode, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  Compass,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  User as UserIcon,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store";
import { initials } from "@/lib/format";
import { ROLE_LABEL } from "@/constants";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

function navForRole(role: string | undefined): NavItem[] {
  if (role === "admin") {
    return [
      { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/opportunities", label: "Marketplace", icon: Compass },
      { to: "/messages", label: "Messages", icon: MessageSquare },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ];
  }
  if (role === "business") {
    return [
      { to: "/business/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/business/opportunities", label: "Opportunities", icon: Briefcase },
      { to: "/business/opportunities/new", label: "Post a role", icon: PlusCircle },
      { to: "/opportunities", label: "Browse marketplace", icon: Compass },
      { to: "/messages", label: "Messages", icon: MessageSquare },
      { to: "/wallet", label: "Billing & payouts", icon: Wallet },
      { to: "/notifications", label: "Notifications", icon: Bell },
    ];
  }
  const base = role === "graduate" ? "/graduate" : "/student";
  return [
    { to: `${base}/dashboard`, label: "Overview", icon: LayoutDashboard },
    { to: "/opportunities", label: "Find work", icon: Compass },
    { to: `${base}/applications`, label: "Applications", icon: FileText },
    { to: "/messages", label: "Messages", icon: MessageSquare },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ];
}

function NavList({
  items,
  onNavigate,
  collapsed,
}: {
  items: NavItem[];
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 px-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.to
          : pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const items = navForRole(user?.role);
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <div className="mt-2 flex-1 overflow-y-auto">
        <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {user ? ROLE_LABEL[user.role] : "Menu"}
        </p>
        <NavList items={items} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-border p-3">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl bg-accent/50 px-3 py-2 text-sm text-accent-foreground hover:bg-accent"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="truncate">Ikusasa beta</span>
        </Link>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
              <div className="min-w-0 lg:hidden">
                <Logo />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials(user?.fullName ?? "Guest")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden text-sm font-medium sm:inline">
                        {user?.fullName?.split(" ")[0] ?? "Guest"}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="text-sm font-medium">{user?.fullName ?? "Guest"}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user?.email}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserIcon className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star className="mr-2 h-4 w-4" /> Reviews
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {(title || actions) && (
            <header className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:mb-8 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
              <div className="min-w-0">
                {title && (
                  <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </header>
          )}
          {children}
        </main>
      </div>

      {/* Decorative icon to keep set */}
      <span className="hidden">
        <Building2 />
      </span>
    </div>
  );
}
