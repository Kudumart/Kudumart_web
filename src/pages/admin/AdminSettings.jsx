import { useEffect, useState } from "react";
import { Camera, Check, Lock, Phone, ShieldCheck, User } from "lucide-react";
import { adminApi, adminSession } from "../../api/admin";
import { uploadImage } from "../../api/upload";
import { Button, Skeleton } from "../../components/ui";
import { useResource } from "../../hooks/useResource";
import PhoneField from "../../components/PhoneField";
import {
  internationalPhone,
  nationalPhoneInput,
  phoneCountryFor,
} from "../../utils/phone";

export function AdminSettings() {
  const [tab, setTab] = useState("profile");
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  const profileResource = useResource((signal) => adminApi.profile(signal), []);
  const profile = profileResource.data || adminSession.getUser() || {};

  // Profile Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [countryCode, setCountryCode] = useState("NG");
  const [phoneDigits, setPhoneDigits] = useState("");

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (profileResource.data || adminSession.getUser()) {
      const u = profileResource.data || adminSession.getUser() || {};
      setName(u.name || "");
      setEmail(u.email || "");
      setPhoto(u.photo || "");
      if (u.phoneNumber) {
        const detectedCountry = phoneCountryFor(u.phoneNumber, "NG");
        setCountryCode(detectedCountry);
        setPhoneDigits(nationalPhoneInput(u.phoneNumber, detectedCountry));
      }
    }
  }, [profileResource.data]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      setFeedback(null);
      const url = await uploadImage(file);
      setPhoto(url);
      setFeedback({ type: "success", message: "Photo uploaded. Remember to save changes." });
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to upload photo." });
    } finally {
      setBusy(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const formattedPhone = phoneDigits.trim()
        ? internationalPhone(phoneDigits, countryCode)
        : null;

      const payload = {
        name: name.trim(),
        email: email.trim(),
        photo,
        phoneNumber: formattedPhone,
      };

      await adminApi.updateProfile(payload);
      setFeedback({
        type: "success",
        message: "Profile and enquiry phone number updated successfully.",
      });
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to update profile." });
    } finally {
      setBusy(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await adminApi.updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFeedback({
        type: "success",
        message: "Password updated successfully.",
      });
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Failed to update password." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Settings</h1>
          <p>
            Configure your admin profile, product enquiry phone number, and security credentials.
          </p>
        </div>
      </div>

      <div className="admin-content-tabs">
        <button
          type="button"
          className={tab === "profile" ? "active" : ""}
          onClick={() => {
            setTab("profile");
            setFeedback(null);
          }}
        >
          <User size={16} /> Profile & Enquiry
        </button>
        <button
          type="button"
          className={tab === "security" ? "active" : ""}
          onClick={() => {
            setTab("security");
            setFeedback(null);
          }}
        >
          <ShieldCheck size={16} /> Security
        </button>
      </div>

      {feedback && (
        <div
          className={
            feedback.type === "error"
              ? "admin-error admin-vendor-feedback"
              : "admin-success admin-vendor-feedback"
          }
          style={{ marginBottom: 20 }}
        >
          {feedback.message}
        </div>
      )}

      {profileResource.loading && !profile.name ? (
        <Skeleton className="admin-table-skeleton" style={{ height: 260 }} />
      ) : tab === "profile" ? (
        <section className="admin-card" style={{ maxWidth: 680 }}>
          <form className="admin-content-form" onSubmit={handleProfileSubmit}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 12 }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  background: "#f1f4f8",
                  overflow: "hidden",
                  display: "grid",
                  placeItems: "center",
                  border: "2px solid #e2e8f0",
                }}
              >
                {photo ? (
                  <img
                    src={photo}
                    alt="Admin avatar"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <User size={36} color="#94a3b8" />
                )}
              </div>
              <div>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    padding: "8px 16px",
                    background: "#f1f4f8",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                >
                  <Camera size={16} /> Change photo
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePhotoUpload}
                    disabled={busy}
                  />
                </label>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>
                  JPG, PNG, or WebP. Max 5MB.
                </p>
              </div>
            </div>

            <label>
              Administrator Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin name"
                required
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kudumart.com"
                required
              />
            </label>

            <div>
              <label style={{ display: "block", marginBottom: 6 }}>
                Product enquiry phone number
              </label>
              <PhoneField
                countryCode={countryCode}
                onCountryChange={setCountryCode}
                value={phoneDigits}
                onChange={setPhoneDigits}
              />
              <p style={{ fontSize: 12, color: "#64748b", margin: "6px 0 0" }}>
                This phone number appears on products and stores owned by the admin so customers can call and make direct enquiries.
              </p>
            </div>

            <div style={{ marginTop: 14 }}>
              <Button type="submit" loading={busy}>
                Save changes
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <section className="admin-card" style={{ maxWidth: 520 }}>
          <form className="admin-content-form" onSubmit={handleSecuritySubmit}>
            <label>
              Current Password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
            </label>

            <label>
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                minLength={6}
                required
              />
            </label>

            <label>
              Confirm New Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                minLength={6}
                required
              />
            </label>

            <div style={{ marginTop: 14 }}>
              <Button type="submit" loading={busy}>
                Update password
              </Button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
