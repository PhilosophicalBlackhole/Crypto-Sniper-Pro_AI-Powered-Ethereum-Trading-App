/**
 * File: PasswordResetModal.tsx
 * Purpose: Provide a simple UI for Supabase password recovery flows.
 * - Triggered when Supabase emits a PASSWORD_RECOVERY event.
 * - Lets the user set a new password and confirms via authService.updatePassword.
 */

import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import authService from '../services/authService';
import { toast } from 'sonner';

interface PasswordResetModalProps {
  /** Whether the modal is currently visible. */
  isOpen: boolean;
  /** Called when the modal should be closed. */
  onClose: () => void;
}

/**
 * PasswordResetModal
 * Renders a centered overlay to capture a new password after a Supabase recovery link.
 */
export function PasswordResetModal({
  isOpen,
  onClose,
}: PasswordResetModalProps): JSX.Element | null {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  /**
   * Handle submission of the new password.
   * - Validates basic length/match requirements.
   * - Delegates actual update to authService.updatePassword.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await authService.updatePassword(newPassword);
      if (!res.ok) {
        setError(res.message || 'Failed to update password.');
        return;
      }

      toast.success('Password updated. Please sign in again with your new password.');
      // Clear Supabase session to avoid confusion and force a clean sign-in.
      await authService.signOut();

      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      // Show a generic error while logging the real one.
      console.error('Error updating password:', err);
      setError('Something went wrong while updating your password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader className="relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
          <CardTitle className="text-white text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            Enter a new password to complete your Supabase recovery flow.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300">
                New password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  className="pl-10 bg-slate-800 border-slate-600 text-white"
                  placeholder="Enter a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300">
                Confirm password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                className="bg-slate-800 border-slate-600 text-white"
                placeholder="Re-enter the new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-md p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? 'Updating password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
