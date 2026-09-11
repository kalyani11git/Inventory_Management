"use client";

import { useEffect, useState } from "react";
import { User, UserRole } from "@/src/types";
import { getUsers, updateUserRole } from "@/src/services/users.service";
import { useAuth } from "@/src/components/AuthProvider";
import { EmptyState, Loader } from "@/src/components/ui";
import { useToast } from "@/src/components/Toast";
import { formatDate } from "@/src/lib/format";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { notify } = useToast();
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "owner") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role !== "owner") return;
    getUsers()
      .then(setItems)
      .catch((err) => notify("error", err.message))
      .finally(() => setLoading(false));
  }, [user, notify]);

  async function changeRole(id: string, role: UserRole) {
    try {
      const updated = await updateUserRole(id, role);
      setItems((prev) => prev.map((u) => (u.id === id ? updated : u)));
      notify("success", "Role updated");
    } catch (err: any) {
      notify("error", err.message);
    }
  }

  if (user?.role !== "owner") return null;

  return (
    <div>
      <h1 className="page-title">Users</h1>
      <p className="page-sub">
        Owner only. Manage who can log in. Each user still manages their own
        inventory.
      </p>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="table-wrap scroll">
          <table className="data wide">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Change role</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">
                    {u.name}
                    {u.id === user.id ? " (you)" : ""}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge-in">{u.role}</span>
                  </td>
                  <td>{u.createdAt ? formatDate(u.createdAt) : "-"}</td>
                  <td>
                    <select
                      className="select"
                      value={u.role}
                      onChange={(e) =>
                        changeRole(u.id, e.target.value as UserRole)
                      }
                    >
                      <option value="user">user</option>
                      <option value="owner">owner</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
