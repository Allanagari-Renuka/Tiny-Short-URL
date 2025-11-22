import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [links, setLinks] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchLinks();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLinks = async () => {
    setLoadingLinks(true);
    try {
      const { data, error } = await supabase.from("urls").select("*");
      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      toast.error("Failed to load links");
    } finally {
      setLoadingLinks(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-7xl space-y-12">
        <h1 className="text-4xl font-bold text-center mb-8">Admin Panel</h1>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <p>Loading users...</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted/50 border-b border-border text-sm font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/20">
                        <td className="py-2 px-4">{user.id}</td>
                        <td className="py-2 px-4">{user.email}</td>
                        <td className="py-2 px-4">{new Date(user.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>All Links</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLinks ? (
                <p>Loading links...</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted/50 border-b border-border text-sm font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4">Short Code</th>
                      <th className="py-3 px-4">Original URL</th>
                      <th className="py-3 px-4">Clicks</th>
                      <th className="py-3 px-4">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => (
                      <tr key={link.id} className="hover:bg-muted/20">
                        <td className="py-2 px-4">{link.short_code}</td>
                        <td className="py-2 px-4 truncate max-w-[400px]" title={link.original_url}>
                          {link.original_url}
                        </td>
                        <td className="py-2 px-4">{link.clicks || 0}</td>
                        <td className="py-2 px-4">{new Date(link.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Additional admin features like Abuse Reports, System Analytics, Health Checks, Logs 
            can be added here following similar patterns */}

      </div>
    </div>
  );
};

export default Admin;
