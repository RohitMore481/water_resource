import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LanguageProvider } from './LanguageContext';
import { io } from 'socket.io-client';

const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize]     = useState(undefined);
  const [currentColor, setCurrentColor] = useState('#00d4ff');
  const [currentMode, setCurrentMode]   = useState('Dark');
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu]     = useState(true);
  const [isClicked, setIsClicked]       = useState(initialState);

  // === Live sensor state ===
  const [sensors, setSensors]           = useState([]);
  const [sensorHistory, setSensorHistory] = useState({}); // { sensorId: [readings...] }
  const [alerts, setAlerts]             = useState([]);
  const [simulationMode, setSimulationMode] = useState('normal');
  const socketRef = useRef(null);

  useEffect(() => {
    const currentThemeColor = localStorage.getItem('colorMode');
    const currentThemeMode  = localStorage.getItem('themeMode');
    if (currentThemeColor) setCurrentColor(currentThemeColor);
    if (currentThemeMode)  setCurrentMode(currentThemeMode);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('jr_token');
    if (!token) return; // Don't connect if not authenticated

    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect',       () => console.log('[WS] Connected:', socket.id));
    socket.on('disconnect',    () => console.log('[WS] Disconnected'));
    socket.on('connect_error', (e) => console.warn('[WS] Error:', e.message));

    socket.on('sensor_update', (updates) => {
      setSensors(updates);
      setSensorHistory((prev) => {
        const next = { ...prev };
        updates.forEach((u) => {
          const hist = prev[u.sensor_id] || [];
          next[u.sensor_id] = [...hist.slice(-49), u];
        });
        return next;
      });
    });

    socket.on('leak_alert', (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 20));
    });

    socket.on('contamination_alert', (alert) => {
      setAlerts((prev) => [alert, ...prev].slice(0, 20));
    });

    socket.on('simulation_mode', ({ mode }) => {
      setSimulationMode(mode);
    });

    socket.on('alert_resolved', ({ id }) => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    });

    return () => { socket.disconnect(); };
  }, [localStorage.getItem('jr_token')]); // reconnect when token changes

  const addAlert  = (alert)  => setAlerts((prev) => [alert, ...prev].slice(0, 20));
  const dismissAlert = (id)  => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const triggerLeak = () => {
    socketRef.current?.emit('simulate_leak');
  };
  const triggerContamination = () => {
    socketRef.current?.emit('simulate_contamination');
  };
  const resetSimulation = () => {
    socketRef.current?.emit('reset_simulation');
  };

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    localStorage.setItem('themeMode', e.target.value);
  };

  const setColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem('colorMode', color);
  };

  const handleClick = (clicked) => setIsClicked({ ...initialState, [clicked]: true });

  return (
    <LanguageProvider>
      {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
      <StateContext.Provider value={{
        currentColor, currentMode, activeMenu, screenSize, setScreenSize,
        handleClick, isClicked, initialState, setIsClicked, setActiveMenu,
        setCurrentColor, setCurrentMode, setMode, setColor,
        themeSettings, setThemeSettings,
        // Live data
        sensors, sensorHistory, alerts, simulationMode,
        addAlert, dismissAlert,
        triggerLeak, triggerContamination, resetSimulation,
      }}>
        {children}
      </StateContext.Provider>
    </LanguageProvider>
  );
};

export const useStateContext = () => useContext(StateContext);
