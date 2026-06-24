import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuthStore, useUiStore } from "@/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initials } from "@/lib/format";
import { Bell, Lock, Palette, Trash2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import type { Business, Graduate, Student } from "@/types";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!user) {
    return (
      <AppShell title="Settings">
        <p className="text-sm text-muted-foreground">Sign in to manage your settings.</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings" description="Account, notifications, security, and appearance.">
      <Tabs defaultValue="account" className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <TabsList className="flex h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0">
          <TabsTrigger value="account" className="justify-start gap-2"><UserIcon className="h-4 w-4" /> Account</TabsTrigger>
          <TabsTrigger value="notifications" className="justify-start gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="security" className="justify-start gap-2"><Lock className="h-4 w-4" /> Security</TabsTrigger>
          <TabsTrigger value="appearance" className="justify-start gap-2"><Palette className="h-4 w-4" /> Appearance</TabsTrigger>
        </TabsList>

        <div>
          <TabsContent value="account" className="mt-0">
            <AccountSection user={user} onSave={(patch) => { updateUser(patch); toast.success("Profile updated"); }} />
          </TabsContent>
          <TabsContent value="notifications" className="mt-0"><NotificationsSection /></TabsContent>
          <TabsContent value="security" className="mt-0">
            <SecuritySection
              onSignOut={async () => { await logout(); navigate({ to: "/" }); }}
            />
          </TabsContent>
          <TabsContent value="appearance" className="mt-0"><AppearanceSection /></TabsContent>
        </div>
      </Tabs>
    </AppShell>
  );
}

function AccountSection({ user, onSave }: { user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]>; onSave: (p: any) => void }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [city, setCity] = useState("city" in user ? (user as Student).city ?? "" : "");
  const [companyName, setCompanyName] = useState(user.role === "business" ? (user as Business).companyName : "");
  const [description, setDescription] = useState(user.role === "business" ? (user as Business).description : "");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials(fullName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Basic information shown across Ikusasa.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          {(user.role === "student" || user.role === "graduate") && (
            <Field label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Cape Town" /></Field>
          )}
          {user.role === "business" && (
            <>
              <Field label="Company name"><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></Field>
              <div className="sm:col-span-2">
                <Field label="About"><Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
              </div>
            </>
          )}
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => onSave({ fullName, email, ...(user.role !== "business" && city ? { city } : {}), ...(user.role === "business" ? { companyName, description } : {}) })}>
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({ applications: true, messages: true, matches: true, marketing: false, weekly: true });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what we email or push to you.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {[
          ["applications", "Application updates", "Status changes on your applications"],
          ["messages", "Direct messages", "New messages from businesses or talent"],
          ["matches", "Opportunity matches", "Roles that fit your skills and preferences"],
          ["marketing", "Product news", "Occasional updates from the Ikusasa team"],
          ["weekly", "Weekly digest", "A Monday morning recap of activity"],
        ].map(([key, title, desc]) => (
          <div key={key} className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <Switch
              checked={(prefs as any)[key]}
              onCheckedChange={(v) => { setPrefs((p) => ({ ...p, [key]: v })); toast.success("Preferences saved"); }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SecuritySection({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update the password used to sign in.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password"><Input type="password" /></Field>
          <div />
          <Field label="New password"><Input type="password" /></Field>
          <Field label="Confirm new password"><Input type="password" /></Field>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => toast.success("Password updated")}>Update password</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Sign out of this session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={onSignOut}>Sign out</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Delete your Ikusasa account and data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => toast.error("Deletion is disabled in the preview")}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function AppearanceSection() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how Ikusasa looks on your device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Theme">
          <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
            <SelectTrigger className="w-full max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Separator />
        <Field label="Language">
          <Select defaultValue="en-ZA">
            <SelectTrigger className="w-full max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en-ZA">English (South Africa)</SelectItem>
              <SelectItem value="af-ZA">Afrikaans</SelectItem>
              <SelectItem value="zu-ZA">isiZulu</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
