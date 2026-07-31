import React from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Thông tin cá nhân</h1>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 space-y-4">
        <Input label="Họ và tên" id="fullName" value={user?.fullName || ''} readOnly />
        <Input label="Email" id="email" value={user?.email || ''} readOnly />
        <Input label="Vai trò" id="role" value={user?.role || 'CUSTOMER'} readOnly />

        <div className="pt-4 border-t">
          <Button variant="secondary" className="w-full">
            Cập nhật thông tin (Placeholder)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
