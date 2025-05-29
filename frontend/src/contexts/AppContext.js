import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [selectedProfile, setSelectedProfile] = useState(
        localStorage.getItem('selectedProfile') || null
    );

    useEffect(() => {
        if (selectedProfile) {
            localStorage.setItem('selectedProfile', selectedProfile);
        } else {
            localStorage.removeItem('selectedProfile');
        }
    }, [selectedProfile]);

    const selectProfile = (profile) => {
        setSelectedProfile(profile);
    };

    const clearProfile = () => {
        setSelectedProfile(null);
    };

    return (
        <AppContext.Provider value={{ selectedProfile, selectProfile, clearProfile }}>
            {children}
        </AppContext.Provider>
    );
};