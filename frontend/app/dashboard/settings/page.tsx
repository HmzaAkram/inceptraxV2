"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  })

  const [password, setPassword] = useState("")

  // ------------------ FETCH PROFILE ------------------
  async function fetchProfile() {
    try {
      const res = await apiFetch("/users/profile")
      setForm(res.data.user)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // ------------------ SAVE PROFILE ------------------
  async function handleSaveProfile() {
    setSaving(true)
    try {
      await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      })
      alert("Profile updated successfully")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ------------------ RESET PASSWORD ------------------
  async function handleResetPassword() {
    if (!password) return alert("Enter new password")

    try {
      await apiFetch("/users/reset-password", {
        method: "PUT",
        body: JSON.stringify({ new_password: password }),
      })
      alert("Password reset successful")
      setPassword("")
    } catch (err: any) {
      alert(err.message)
    }
  }

  // ------------------ DELETE ACCOUNT ------------------
  async function handleDeleteAccount() {
    const confirmDelete = confirm(
      "Are you sure? This will permanently delete your account."
    )

    if (!confirmDelete) return

    try {
      await apiFetch("/users/delete-account", {
        method: "DELETE",
      })
      localStorage.removeItem("token")
      window.location.href = "/login"
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* PROFILE */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex gap-6 items-center">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/diverse-user-avatars.png" />
              <AvatarFallback>
                {form.first_name[0]}
                {form.last_name[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Last Name</Label>
              <Input
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* RESET PASSWORD */}
      <Card>
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button onClick={handleResetPassword}>
            Reset Password
          </Button>
        </CardContent>
      </Card>

      {/* DELETE ACCOUNT */}
      <Card className="border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">
            Danger Zone
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-red-600 text-sm">
            This action is permanent and cannot be undone.
          </p>

          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
