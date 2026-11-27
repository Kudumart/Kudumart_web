import { useEffect, useState } from "react";
import { Camera, Check, Lock, MapPin, PackageCheck, Phone, ShieldCheck, User } from "lucide-react";
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

  const pickupResource = useResource(
    (signal) => adminApi.pickupSettings(signal).catch(() => null),
    [],
  );

  // Profile Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [countryCode, setCountryCode] = useState("NG");
  const [phoneDigits, setPhoneDigits] = useState("");

  // Pickup Address Form State
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [pickupLabel, setPickupLabel] = useState("Pick up from KuduMart");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupNote, setPickupNote] = useState("");

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const data = pickupResource.data?.data || pickupResource.data;
    if (data && typeof data === "object") {
      setPickupEnabled(
        typeof data.pickupEnabled === "boolean" ? data.pickupEnabled : true,
      );
      setPickupLabel(data.pickupLabel || "Pick up from KuduMart");
      setPickupAddress(data.pickupAddress || "");
      setPickupNote(data.pickupNote || "");
    }
  }, [pickupResource.data]);

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

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      await adminApi.savePickupSettings({
        pickupEnabled,
        pickupLabel: pickupLabel.trim() || "Pick up from KuduMart",
        pickupAddress: pickupAddress.trim(),
        pickupNote: pickupNote.trim(),
      });
      setFeedback({
        type: "success",
        message: "Pickup address settings updated successfully. Buyers will see this immediately at checkout.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Failed to update pickup settings.",
      });
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
            Configure your admin profile, official store pickup address, product enquiry phone, and security credentials.
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
          className={tab === "pickup" ? "active" : ""}
          onClick={() => {
            setTab("pickup");
            setFeedback(null);
          }}
        >
          <MapPin size={16} /> Pickup Address
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
      ) : tab === "pickup" ? (
        <section className="admin-card" style={{ maxWidth: 680 }}>
          <form className="admin-content-form" onSubmit={handlePickupSubmit}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "14px 16px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: 14, color: "#0f172a" }}>
                  Enable KuduMart Store Pickup at Checkout
                </strong>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Turn off if you only want home delivery and do not offer physical pickup.
                </span>
              </div>
              <input
                type="checkbox"
                checked={pickupEnabled}
                onChange={(e) => setPickupEnabled(e.target.checked)}
                style={{ width: 20, height: 20, accentColor: "#f36b31", cursor: "pointer" }}
              />
            </div>

            <label>
              Pickup Option Title
              <input
                type="text"
                value={pickupLabel}
                onChange={(e) => setPickupLabel(e.target.value)}
                placeholder="e.g. Pick up from KuduMart"
                disabled={!pickupEnabled}
                required={pickupEnabled}
              />
            </label>

            <label>
              Official Pickup Address
              <textarea
                rows={3}
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter the exact street address, landmark, city, and state where customers can collect orders..."
                disabled={!pickupEnabled}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #dce2e7",
                  font: "inherit",
                  resize: "vertical",
                }}
              />
            </label>

            <label>
              Pickup Instructions / Hours (Optional)
              <input
                type="text"
                value={pickupNote}
                onChange={(e) => setPickupNote(e.target.value)}
                placeholder="e.g. Mon–Sat, 9:00 AM – 5:00 PM. Bring your order confirmation."
                disabled={!pickupEnabled}
              />
            </label>

            {pickupEnabled && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "1px solid #fed7aa",
                  background: "#fff9f5",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#c2410c",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  Checkout Preview
                </span>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <PackageCheck size={20} color="#dd5821" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ display: "block", fontSize: 13, color: "#17233c" }}>
                      {pickupLabel.trim() || "Pick up from KuduMart"}
                    </strong>
                    <small style={{ display: "block", fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      {pickupAddress.trim() || "Pickup details will be shared upon order confirmation."}
                    </small>
                    {pickupNote.trim() && (
                      <small style={{ display: "block", fontSize: 11, color: "#9a3412", marginTop: 4 }}>
                        {pickupNote.trim()}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 14 }}>
              <Button type="submit" loading={busy}>
                Save Pickup Settings
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
