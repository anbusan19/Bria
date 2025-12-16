'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, signOut } = useAuth();

    if (!user) return null;

    const handleSignOut = async () => {
        try {
            await signOut();
            setIsOpen(false);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-2 transition-colors"
            >
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-semibold">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                )}
                <span className="text-white font-medium hidden sm:block">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-64 bg-[#0f0f11] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                        <div className="p-4 border-b border-white/10">
                            <p className="text-white font-semibold">{user.displayName || 'User'}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-3 text-left text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
