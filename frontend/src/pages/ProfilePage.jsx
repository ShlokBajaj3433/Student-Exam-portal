import { useState, useEffect } from 'react';
import {
  User, Mail, Shield, Calendar, Building2, GraduationCap,
  Pencil, CheckCircle2, AlertCircle, Loader2, X, Save, KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getStudentProfile, updateStudentProfile,
  getAdminProfile, updateAdminProfile,
} from '../services/profileService';

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

const ROLE_STYLES = {
  ADMIN:   'bg-indigo-100 text-indigo-700 border-indigo-200',
  STUDENT: 'bg-teal-100 text-teal-700 border-teal-200',
};

// ─── AvatarCircle ─────────────────────────────────────────────────────────────

function AvatarCircle({ name, size = 'lg' }) {
  const initials = (name || '?').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const sizeClass = size === 'lg'
    ? 'w-20 h-20 text-2xl'
    : 'w-12 h-12 text-base';
  return (
    <div className={`${sizeClass} rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 select-none`}>
      {initials}
    </div>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="mt-0.5 p-2 rounded-lg bg-gray-100">
        <Icon size={14} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5 break-all">{value || '—'}</p>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  const base = type === 'success'
    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
    : 'bg-red-50 border-red-300 text-red-800';
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${base}`}>
      <Icon size={16} />
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100"><X size={14}/></button>
    </div>
  );
}

// ─── EditModal ────────────────────────────────────────────────────────────────

function EditModal({ profile, role, onClose, onSaved }) {
  const isStudent = role === 'STUDENT';
  const [form, setForm] = useState({
    name:        profile.name        ?? '',
    department:  profile.department  ?? '',
    yearOfStudy: profile.yearOfStudy ?? '',
  });
  const [errors, setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (isStudent && form.yearOfStudy) {
      const yr = Number(form.yearOfStudy);
      if (isNaN(yr) || yr < 1 || yr > 10) e.yearOfStudy = 'Year must be between 1 and 10.';
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setApiError('');
    try {
      if (isStudent) {
        await updateStudentProfile({
          name: form.name.trim(),
          department: form.department.trim() || null,
          yearOfStudy: form.yearOfStudy ? Number(form.yearOfStudy) : null,
        });
      } else {
        await updateAdminProfile({ name: form.name.trim() });
      }
      onSaved();
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-800">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              <AlertCircle size={14}/>{apiError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Your full name"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Student-only fields */}
          {isStudent && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <input name="department" value={form.department} onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Year of Study
                </label>
                <input name="yearOfStudy" type="number" value={form.yearOfStudy} onChange={handleChange}
                  min={1} max={10} placeholder="1–10"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                    ${errors.yearOfStudy ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.yearOfStudy && <p className="text-xs text-red-500 mt-1">{errors.yearOfStudy}</p>}
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
              {submitting ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────

function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const role = authUser?.role;
  const isStudent = role === 'STUDENT';

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [editing, setEditing]   = useState(false);
  const [toast, setToast]       = useState(null); // { message, type }

  async function fetchProfile() {
    setLoading(true);
    setFetchError('');
    try {
      const res = isStudent ? await getStudentProfile() : await getAdminProfile();
      setProfile(res.data);
    } catch (err) {
      setFetchError(err?.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProfile(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSaved() {
    setEditing(false);
    setToast({ message: 'Profile updated successfully.', type: 'success' });
    fetchProfile();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 size={28} className="animate-spin mr-2"/> Loading profile…
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-2"/>
        <p className="text-sm text-red-700">{fetchError}</p>
        <button onClick={fetchProfile} className="mt-4 px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700">
          Retry
        </button>
      </div>
    );
  }

  const displayName = profile?.name || authUser?.name || authUser?.email || '?';

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        {/* Banner */}
        <div className={`h-20 ${isStudent ? 'bg-gradient-to-r from-teal-600 to-teal-400' : 'bg-gradient-to-r from-indigo-700 to-indigo-500'}`} />

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <AvatarCircle name={displayName} size="lg" />
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              <Pencil size={14}/> Edit Profile
            </button>
          </div>

          {/* Name + role */}
          <div>
            <h1 className="text-xl font-bold text-gray-800">{displayName}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${ROLE_STYLES[role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {role}
              </span>
              {isStudent && profile?.studentCode && (
                <span className="text-xs text-gray-400 font-mono">{profile.studentCode}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-2 mb-6">
        <InfoRow icon={Mail}         label="Email"          value={profile?.email} />
        <InfoRow icon={User}         label="Full Name"      value={profile?.name} />
        <InfoRow icon={Shield}       label="Role"           value={role} />
        <InfoRow icon={Calendar}     label="Member Since"   value={formatDate(profile?.createdAt)} />
        {isStudent && (
          <>
            <InfoRow icon={Building2}    label="Department"     value={profile?.department} />
            <InfoRow icon={GraduationCap} label="Year of Study" value={profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : null} />
          </>
        )}
      </div>

      {/* Security notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
        <KeyRound size={16} className="text-amber-600 mt-0.5 flex-shrink-0"/>
        <div>
          <p className="text-sm font-semibold text-amber-800">Password Changes</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Password changes are not supported from the profile page. Contact your administrator to reset your password.
          </p>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <EditModal
          profile={profile}
          role={role}
          onClose={() => setEditing(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}

export default ProfilePage;
