import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const Settings = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });
  const [darkMode, setDarkMode] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordsChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = () => {
    toast.success("Profile saved (stub)");
  };

  const handleChangePassword = () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    toast.success("Password changed (stub)");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(`Switched to ${darkMode ? "light" : "dark"} mode (stub)`);
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-3xl space-y-12">
        <h1 className="text-4xl font-bold text-center mb-8">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Username</label>
              <Input
                name="username"
                value={profile.username}
                onChange={handleProfileChange}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Email</label>
              <Input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="Enter email"
              />
            </div>
            <Button onClick={handleSaveProfile}>Save Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Current Password</label>
              <Input
                name="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handlePasswordsChange}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">New Password</label>
              <Input
                name="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={handlePasswordsChange}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Confirm New Password</label>
              <Input
                name="confirmNewPassword"
                type="password"
                value={passwords.confirmNewPassword}
                onChange={handlePasswordsChange}
              />
            </div>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
